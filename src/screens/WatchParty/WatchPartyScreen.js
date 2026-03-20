import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import apiClient from '../../services/apiClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function WatchPartyScreen({ route, navigation }) {
  const { movieSlug } = route.params || {};
  const { user } = useUser();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(!!movieSlug);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [password, setPassword] = useState('');

  // Create room form
  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [maxMembers, setMaxMembers] = useState('10');
  const [creating, setCreating] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/watch-party/rooms');
      setRooms(res.data.rooms || res.data || []);
    } catch (err) {
      console.error('Fetch rooms error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    fetchRooms();
  }, [user, fetchRooms]);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên phòng');
      return;
    }
    try {
      setCreating(true);
      const res = await apiClient.post('/api/watch-party/rooms', {
        name: roomName.trim(),
        password: roomPassword || undefined,
        maxMembers: parseInt(maxMembers) || 10,
        movieSlug: movieSlug || undefined,
      });
      setShowCreateModal(false);
      const roomId = res.data.room?._id || res.data.roomId;
      if (roomId) {
        navigation.navigate('WatchPartyRoom', { roomId });
      }
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể tạo phòng');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = (room) => {
    if (room.hasPassword) {
      setSelectedRoom(room);
      setShowPasswordModal(true);
    } else {
      navigation.navigate('WatchPartyRoom', { roomId: room._id });
    }
  };

  const handlePasswordSubmit = () => {
    setShowPasswordModal(false);
    navigation.navigate('WatchPartyRoom', {
      roomId: selectedRoom._id,
      password,
    });
    setPassword('');
  };

  if (loading) return <LoadingSpinner />;

  const renderRoom = ({ item }) => (
    <TouchableOpacity
      style={styles.roomCard}
      onPress={() => handleJoinRoom(item)}
      activeOpacity={0.8}
    >
      <View style={styles.roomHeader}>
        <Text style={styles.roomName} numberOfLines={1}>{item.name}</Text>
        {item.hasPassword && <Ionicons name="lock-closed" size={14} color={COLORS.warning} />}
      </View>
      <Text style={styles.roomHost} numberOfLines={1}>
        Host: {item.host?.name || 'Unknown'}
      </Text>
      {item.currentMovie && (
        <Text style={styles.roomMovie} numberOfLines={1}>
          🎬 {item.currentMovie.name || item.currentMovie}
        </Text>
      )}
      <View style={styles.roomFooter}>
        <View style={styles.memberCount}>
          <Ionicons name="people" size={14} color={COLORS.textSecondary} />
          <Text style={styles.memberCountText}>
            {item.members?.length || 0}/{item.maxMembers || 10}
          </Text>
        </View>
        <View style={[styles.statusDot, item.isPlaying && styles.statusPlaying]} />
        <Text style={styles.statusText}>{item.isPlaying ? 'Đang phát' : 'Chờ'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Watch Party</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Chưa có phòng nào</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
              <Ionicons name="add" size={20} color="#000" />
              <Text style={styles.createBtnText}>Tạo phòng mới</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Room Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo phòng xem chung</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.fieldLabel}>Tên phòng *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập tên phòng"
                placeholderTextColor={COLORS.textMuted}
                value={roomName}
                onChangeText={setRoomName}
              />

              <Text style={styles.fieldLabel}>Mật khẩu (tùy chọn)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Để trống nếu không cần"
                placeholderTextColor={COLORS.textMuted}
                value={roomPassword}
                onChangeText={setRoomPassword}
                secureTextEntry
              />

              <Text style={styles.fieldLabel}>Số người tối đa</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="10"
                placeholderTextColor={COLORS.textMuted}
                value={maxMembers}
                onChangeText={setMaxMembers}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[styles.modalBtn, creating && { opacity: 0.6 }]}
                onPress={handleCreateRoom}
                disabled={creating}
              >
                <Text style={styles.modalBtnText}>
                  {creating ? 'Đang tạo...' : 'Tạo phòng'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Password Modal */}
      <Modal visible={showPasswordModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { minHeight: 0 }]}>
            <Text style={styles.modalTitle}>Nhập mật khẩu phòng</Text>
            <TextInput
              style={[styles.modalInput, { marginTop: SPACING.md }]}
              placeholder="Mật khẩu"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { flex: 1, backgroundColor: COLORS.surface }]}
                onPress={() => { setShowPasswordModal(false); setPassword(''); }}
              >
                <Text style={[styles.modalBtnText, { color: COLORS.text }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { flex: 1, marginLeft: SPACING.sm }]}
                onPress={handlePasswordSubmit}
              >
                <Text style={styles.modalBtnText}>Vào phòng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { color: COLORS.text, fontSize: FONTS.xxl, fontWeight: '800' },
  list: { paddingHorizontal: SPACING.lg },
  roomCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.sm,
  },
  roomHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  roomName: { color: COLORS.text, fontSize: FONTS.lg, fontWeight: '700', flex: 1, marginRight: 8 },
  roomHost: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginBottom: 4 },
  roomMovie: { color: COLORS.primary, fontSize: FONTS.sm, marginBottom: 8 },
  roomFooter: { flexDirection: 'row', alignItems: 'center' },
  memberCount: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: SPACING.md },
  memberCountText: { color: COLORS.textSecondary, fontSize: FONTS.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textMuted, marginRight: 4 },
  statusPlaying: { backgroundColor: COLORS.accentGreen },
  statusText: { color: COLORS.textSecondary, fontSize: FONTS.xs },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.md, marginTop: SPACING.md, marginBottom: SPACING.lg },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, gap: 6,
  },
  createBtnText: { color: '#000', fontSize: FONTS.md, fontWeight: '700' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl, padding: SPACING.xxl, minHeight: 300,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  modalTitle: { color: COLORS.text, fontSize: FONTS.xl, fontWeight: '700' },
  fieldLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.xs, marginTop: SPACING.sm },
  modalInput: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg,
    height: 48, color: COLORS.text, fontSize: FONTS.md, borderWidth: 1, borderColor: COLORS.border,
  },
  modalBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md,
    alignItems: 'center', marginTop: SPACING.lg,
  },
  modalBtnText: { color: '#000', fontSize: FONTS.lg, fontWeight: '700' },
  modalActions: { flexDirection: 'row', marginTop: SPACING.md },
});
