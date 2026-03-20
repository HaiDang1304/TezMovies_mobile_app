import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  AppState,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CommentSection from '../../components/Comment/CommentSection';
import { getMovieDetail } from '../../services/movieApi';
import { useAuth } from '../../context/AuthContext';
import { useWatchHistory } from '../../context/WatchHistoryContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = (width * 9) / 16;

export default function WatchMovieScreen({ route, navigation }) {
  const { slug, serverIndex = 0, episodeIndex = 0, isTrailer, trailerUrl } = route.params;
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState(serverIndex);
  const [selectedEpisode, setSelectedEpisode] = useState(episodeIndex);
  const { user } = useAuth();
  const { addToWatchHistory } = useWatchHistory();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const data = await getMovieDetail(slug);
        if (data?.movie) {
          setMovie(data.movie);
          setEpisodes(data.episodes || []);
        }
      } catch (err) {
        console.error('Failed to load movie for watching:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [slug]);

  // Save watch history
  useEffect(() => {
    if (!movie || !user) return;
    const currentEp = episodes[selectedServer]?.server_data?.[selectedEpisode];
    if (currentEp) {
      addToWatchHistory({
        slug: movie.slug,
        name: movie.name,
        poster_url: movie.poster_url,
        thumb_url: movie.thumb_url,
        episode_name: currentEp.name,
        episode_slug: currentEp.slug,
        server_index: selectedServer,
        episode_index: selectedEpisode,
      });
    }
  }, [movie, selectedServer, selectedEpisode, user]);

  const currentEpisode = episodes[selectedServer]?.server_data?.[selectedEpisode];
  const embedUrl = isTrailer ? trailerUrl : currentEpisode?.link_embed;

  const handleEpisodeSelect = (serverIdx, epIdx) => {
    setSelectedServer(serverIdx);
    setSelectedEpisode(epIdx);
  };

  if (loading) return <LoadingSpinner />;
  if (!movie) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy phim</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      {/* Video Player */}
      <View style={styles.videoContainer}>
        {embedUrl ? (
          <WebView
            source={{ uri: embedUrl }}
            style={styles.video}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.videoLoading}>
                <LoadingSpinner text="Đang tải video..." fullScreen={false} />
              </View>
            )}
          />
        ) : (
          <View style={[styles.video, styles.noVideo]}>
            <Ionicons name="videocam-off-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.noVideoText}>Không có nguồn phát</Text>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title bar */}
        <View style={styles.titleBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.titleContent}>
            <Text style={styles.movieTitle} numberOfLines={1}>{movie.name}</Text>
            {currentEpisode && (
              <Text style={styles.episodeName} numberOfLines={1}>{currentEpisode.name}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.watchPartyBtn}
            onPress={() => {
              if (!user) { navigation.navigate('Login'); return; }
              navigation.navigate('WatchParty', { movieSlug: slug });
            }}
          >
            <Ionicons name="people" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Server selection */}
        {episodes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nguồn phát</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {episodes.map((server, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.serverBtn, selectedServer === idx && styles.serverBtnActive]}
                  onPress={() => { setSelectedServer(idx); setSelectedEpisode(0); }}
                >
                  <Text style={[styles.serverBtnText, selectedServer === idx && styles.serverBtnTextActive]}>
                    {server.server_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Episode grid */}
        {episodes[selectedServer]?.server_data?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Danh sách tập ({episodes[selectedServer].server_data.length} tập)
            </Text>
            <View style={styles.episodeGrid}>
              {episodes[selectedServer].server_data.map((ep, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.episodeBtn,
                    selectedEpisode === idx && styles.episodeBtnActive,
                  ]}
                  onPress={() => handleEpisodeSelect(selectedServer, idx)}
                >
                  <Text
                    style={[
                      styles.episodeBtnText,
                      selectedEpisode === idx && styles.episodeBtnTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {ep.name || `Tập ${idx + 1}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Movie info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin phim</Text>
          <Text style={styles.synopsis} numberOfLines={5}>
            {(movie.content || movie.description || '').replace(/<[^>]+>/g, '')}
          </Text>
        </View>

        {/* Comments */}
        <CommentSection slug={slug} user={user} />

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  videoContainer: {
    width: '100%',
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  videoLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  noVideo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideoText: {
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    marginRight: SPACING.sm,
  },
  titleContent: {
    flex: 1,
  },
  movieTitle: {
    color: COLORS.text,
    fontSize: FONTS.lg,
    fontWeight: '700',
  },
  episodeName: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
  },
  watchPartyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONTS.lg,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  serverBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
  },
  serverBtnActive: {
    backgroundColor: COLORS.primary,
  },
  serverBtnText: {
    color: COLORS.text,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  serverBtnTextActive: {
    color: '#000',
  },
  episodeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  episodeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    minWidth: 60,
    alignItems: 'center',
  },
  episodeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  episodeBtnText: {
    color: COLORS.text,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  episodeBtnTextActive: {
    color: '#000',
  },
  synopsis: {
    color: COLORS.textSecondary,
    fontSize: FONTS.md,
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.textMuted,
    fontSize: FONTS.lg,
  },
});
