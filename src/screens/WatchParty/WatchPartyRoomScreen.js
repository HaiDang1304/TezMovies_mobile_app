import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useUser } from '../../context/UserContext';
import watchPartySocket from '../../services/watchPartySocket';
import apiClient from '../../services/apiClient';
import CachedImage from '../../components/common/CachedImage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

export default function WatchPartyRoomScreen({ route, navigation }) {
  const { roomId, password } = route.params;
  const { user } = useUser();
  const chatListRef = useRef(null);
  const heartbeatRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');

  const isHost = room?.host?._id === user?._id || room?.host === user?._id;

  // Connect to socket and join room
  useEffect(() => {
    if (!user || !roomId) return;

    watchPartySocket.connect(user.token);

    watchPartySocket.joinRoom(roomId, password);

    const socket = watchPartySocket.socket;
    if (!socket) return;

    socket.on('room:joined', (data) => {
      setRoom(data.room);
      setMembers(data.room?.members || []);
      setMessages(data.room?.messages || data.messages || []);
      if (data.room?.currentMedia) {
        loadMedia(data.room.currentMedia);
      }
      setLoading(false);
    });

    socket.on('room:updated', (data) => {
      if (data.room) {
        setRoom(data.room);
        setMembers(data.room.members || []);
      }
    });

    socket.on('room:error', (data) => {
      Alert.alert('Lỗi', data.message || 'Lỗi không xác định');
      navigation.goBack();
    });

    socket.on('member:joined', (data) => {
      setMembers(prev => {
        if (prev.find(m => (m._id || m.user?._id) === (data.user?._id || data.userId))) return prev;
        return [...prev, data.user || { _id: data.userId, name: data.userName }];
      });
      addSystemMessage(`${data.user?.name || data.userName} đã tham gia`);
    });

    socket.on('member:left', (data) => {
      setMembers(prev => prev.filter(m => (m._id || m.user?._id) !== (data.userId)));
      addSystemMessage(`${data.userName || 'Người dùng'} đã rời phòng`);
    });

    socket.on('member:kicked', (data) => {
      if (data.userId === user._id) {
        Alert.alert('Thông báo', 'Bạn đã bị kick khỏi phòng');
        navigation.goBack();
      } else {
        setMembers(prev => prev.filter(m => (m._id || m.user?._id) !== data.userId));
      }
    });

    socket.on('chat:message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('playback:play', (data) => {
      setIsPlaying(true);
      if (data.currentTime != null) setCurrentTime(data.currentTime);
    });

    socket.on('playback:pause', (data) => {
      setIsPlaying(false);
      if (data.currentTime != null) setCurrentTime(data.currentTime);
    });

    socket.on('playback:seek', (data) => {
      if (data.currentTime != null) setCurrentTime(data.currentTime);
    });

    socket.on('playback:mediaChanged', (data) => {
      if (data.media) loadMedia(data.media);
    });

    socket.on('playback:sync', (data) => {
      setIsPlaying(data.isPlaying);
      if (data.currentTime != null) setCurrentTime(data.currentTime);
    });

    socket.on('room:deleted', () => {
      Alert.alert('Thông báo', 'Phòng đã bị xóa');
      navigation.goBack();
    });

    return () => {
      watchPartySocket.leaveRoom(roomId);
      watchPartySocket.disconnect();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [user, roomId]);

  // Host heartbeat
  useEffect(() => {
    if (isHost) {
      heartbeatRef.current = setInterval(() => {
        watchPartySocket.hostHeartbeat(roomId);
      }, 30000);
      return () => clearInterval(heartbeatRef.current);
    }
  }, [isHost, roomId]);

  const loadMedia = async (media) => {
    try {
      const slug = media.slug || media.movieSlug;
      if (!slug) return;
      const res = await fetch(`https://phimapi.com/phim/${slug}`);
      const data = await res.json();
      if (data.status && data.movie) {
        const allEps = [];
        (data.episodes || []).forEach(server => {
          (server.server_data || []).forEach(ep => {
            allEps.push({ ...ep, serverName: server.server_name });
          });
        });
        setEpisodes(allEps);
        const selectedEp = allEps.find(e =>
          e.slug === media.episodeSlug || e.name === media.episodeName
        ) || allEps[0];
        if (selectedEp) {
          setCurrentEpisode(selectedEp);
          setEmbedUrl(selectedEp.link_embed || '');
        }
      }
    } catch (e) {
      console.error('Load media error:', e);
    }
  };

  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, { _id: Date.now(), system: true, text, createdAt: new Date() }]);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    watchPartySocket.sendMessage(roomId, message.trim());
    setMessage('');
  };

  const handlePlay = () => watchPartySocket.play(roomId, currentTime);
  const handlePause = () => watchPartySocket.pause(roomId, currentTime);
  const handleSeek = (time) => watchPartySocket.seek(roomId, time);

  const handleEpisodeChange = (ep) => {
    setCurrentEpisode(ep);
    setEmbedUrl(ep.link_embed || '');
    setShowEpisodes(false);
    if (isHost) {
      watchPartySocket.changeMedia(roomId, {
        slug: room?.currentMedia?.slug,
        episodeSlug: ep.slug,
        episodeName: ep.name,
      });
    }
  };

  const handleKick = (memberId, memberName) => {
    Alert.alert('Kick', `Kick ${memberName} khỏi phòng?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Kick', style: 'destructive', onPress: () => watchPartySocket.kickMember(roomId, memberId) },
    ]);
  };

  const handleDeleteRoom = () => {
    Alert.alert('Xóa phòng', 'Bạn có chắc muốn xóa phòng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: () => {
          watchPartySocket.deleteRoom(roomId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner />;

  const renderMessage = ({ item }) => {
    if (item.system) {
      return <Text style={styles.systemMsg}>{item.text}</Text>;
    }
    const isMe = item.user?._id === user?._id || item.userId === user?._id;
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && (
          <View style={styles.msgAvatar}>
            <Text style={styles.msgAvatarText}>
              {(item.user?.name || item.userName || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[styles.msgBubble, isMe && styles.msgBubbleMe]}>
          {!isMe && <Text style={styles.msgSender}>{item.user?.name || item.userName}</Text>}
          <Text style={styles.msgText}>{item.message || item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{room?.name || 'Watch Party'}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setShowMembers(!showMembers)} style={styles.headerBtn}>
            <Ionicons name="people" size={20} color={COLORS.text} />
            <Text style={styles.memberBadge}>{members.length}</Text>
          </TouchableOpacity>
          {isHost && (
            <TouchableOpacity onPress={handleDeleteRoom} style={styles.headerBtn}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          {/* Video Player */}
          {embedUrl ? (
            <View style={styles.videoContainer}>
              <WebView
                source={{ uri: embedUrl }}
                style={styles.video}
                allowsFullscreenVideo
                javaScriptEnabled
                mediaPlaybackRequiresUserAction={false}
              />
            </View>
          ) : (
            <View style={[styles.videoContainer, styles.noVideo]}>
              <Ionicons name="videocam-off-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.noVideoText}>Chưa có media</Text>
            </View>
          )}

          {/* Playback Controls (Host only) */}
          {isHost && (
            <View style={styles.controls}>
              <TouchableOpacity onPress={isPlaying ? handlePause : handlePlay} style={styles.controlBtn}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowEpisodes(!showEpisodes)} style={styles.controlBtnSecondary}>
                <Ionicons name="list" size={20} color={COLORS.text} />
                <Text style={styles.controlBtnText}>Tập phim</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Episode List */}
          {showEpisodes && (
            <View style={styles.episodePanel}>
              <Text style={styles.panelTitle}>Danh sách tập</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {episodes.map((ep, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.epChip, currentEpisode?.slug === ep.slug && styles.epChipActive]}
                    onPress={() => handleEpisodeChange(ep)}
                  >
                    <Text style={[styles.epChipText, currentEpisode?.slug === ep.slug && styles.epChipTextActive]}>
                      {ep.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Members Panel */}
          {showMembers && (
            <View style={styles.membersPanel}>
              <Text style={styles.panelTitle}>Thành viên ({members.length})</Text>
              {members.map((m, idx) => {
                const memberId = m._id || m.user?._id;
                const memberName = m.name || m.user?.name || 'Unknown';
                const isMeHost = room?.host?._id === memberId || room?.host === memberId;
                return (
                  <View key={idx} style={styles.memberRow}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>{memberName[0].toUpperCase()}</Text>
                    </View>
                    <Text style={styles.memberName}>{memberName}</Text>
                    {isMeHost && (
                      <View style={styles.hostBadge}>
                        <Text style={styles.hostBadgeText}>Host</Text>
                      </View>
                    )}
                    {isHost && !isMeHost && (
                      <TouchableOpacity onPress={() => handleKick(memberId, memberName)}>
                        <Ionicons name="remove-circle" size={20} color={COLORS.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Chat */}
          <View style={styles.chatContainer}>
            <Text style={styles.panelTitle}>Chat</Text>
            <FlatList
              ref={chatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item, idx) => item._id?.toString() || idx.toString()}
              style={styles.chatList}
              onContentSizeChange={() => chatListRef.current?.scrollToEnd({ animated: true })}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </ScrollView>

        {/* Chat Input */}
        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={COLORS.textMuted}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendBtn}>
            <Ionicons name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { flex: 1, color: COLORS.text, fontSize: FONTS.lg, fontWeight: '700', marginHorizontal: SPACING.md },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  memberBadge: { color: COLORS.primary, fontSize: FONTS.sm, fontWeight: '700' },
  // Video
  videoContainer: { width: SCREEN_WIDTH, height: VIDEO_HEIGHT, backgroundColor: '#000' },
  video: { flex: 1 },
  noVideo: { justifyContent: 'center', alignItems: 'center' },
  noVideoText: { color: COLORS.textMuted, marginTop: 8 },
  // Controls
  controls: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  controlBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full, width: 44, height: 44,
    justifyContent: 'center', alignItems: 'center',
  },
  controlBtnSecondary: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  controlBtnText: { color: COLORS.text, fontSize: FONTS.sm },
  // Episodes
  episodePanel: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  epChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, marginRight: SPACING.xs,
  },
  epChipActive: { backgroundColor: COLORS.primary },
  epChipText: { color: COLORS.text, fontSize: FONTS.sm },
  epChipTextActive: { color: '#000', fontWeight: '700' },
  // Members
  membersPanel: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg, marginTop: SPACING.sm },
  panelTitle: { color: COLORS.text, fontSize: FONTS.md, fontWeight: '700', marginBottom: SPACING.sm },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs, gap: SPACING.sm },
  memberAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  memberAvatarText: { color: '#000', fontWeight: '700', fontSize: FONTS.sm },
  memberName: { flex: 1, color: COLORS.text, fontSize: FONTS.sm },
  hostBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.sm },
  hostBadgeText: { color: '#000', fontSize: FONTS.xs, fontWeight: '700' },
  // Chat
  chatContainer: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, minHeight: 200 },
  chatList: { flex: 1 },
  systemMsg: { color: COLORS.textMuted, fontSize: FONTS.xs, textAlign: 'center', paddingVertical: 4 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: SPACING.xs },
  msgRowMe: { justifyContent: 'flex-end' },
  msgAvatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center', marginRight: 6,
  },
  msgAvatarText: { color: COLORS.text, fontWeight: '700', fontSize: FONTS.xs },
  msgBubble: {
    maxWidth: '70%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
  },
  msgBubbleMe: { backgroundColor: COLORS.primary },
  msgSender: { color: COLORS.primary, fontSize: FONTS.xs, fontWeight: '600', marginBottom: 2 },
  msgText: { color: COLORS.text, fontSize: FONTS.sm },
  // Chat Input
  chatInputContainer: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  chatInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.full, height: 40,
    paddingHorizontal: SPACING.lg, color: COLORS.text, fontSize: FONTS.sm,
  },
  sendBtn: {
    marginLeft: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
  },
});
