import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import MovieCard from '../../components/Movie/MovieCard';
import CommentSection from '../../components/Comment/CommentSection';
import { getMovieDetail, getMoviesByCategory } from '../../services/movieApi';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';
import { getMovieImageUrl } from '../../services/imageUrl';

const { width } = Dimensions.get('window');

export default function MovieDetailScreen({ route, navigation }) {
  const { slug } = route.params;
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedServer, setSelectedServer] = useState(0);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

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
        console.error('Failed to load movie:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [slug]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const firstCategorySlug = movie?.category?.[0]?.slug;
      if (!firstCategorySlug) {
        setRecommendedMovies([]);
        return;
      }

      try {
        setRecommendLoading(true);
        const res = await getMoviesByCategory(firstCategorySlug, 1, 18);
        const items = res?.data?.items || [];
        setRecommendedMovies(items.filter((item) => item.slug !== slug).slice(0, 12));
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setRecommendedMovies([]);
      } finally {
        setRecommendLoading(false);
      }
    };

    fetchRecommendations();
  }, [movie?.category, slug]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem phim ${movie?.name} trên TezMovies!\nhttps://tezmovies.com/phim/${slug}`,
      });
    } catch (err) {
      // ignore
    }
  };

  const handleWatch = () => {
    if (episodes.length > 0 && episodes[0]?.server_data?.length > 0) {
      const firstEp = episodes[0].server_data[0];
      navigation.navigate('WatchMovie', {
        slug,
        episodeSlug: firstEp.slug,
        serverIndex: 0,
        episodeIndex: 0,
      });
    }
  };

  const handleWatchEpisode = (serverIdx, epIdx) => {
    const ep = episodes[serverIdx]?.server_data?.[epIdx];
    if (ep) {
      navigation.navigate('WatchMovie', {
        slug,
        episodeSlug: ep.slug,
        serverIndex: serverIdx,
        episodeIndex: epIdx,
      });
    }
  };

  const handleFavorite = () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    toggleFavorite({
      slug: movie.slug,
      name: movie.name,
      origin_name: movie.origin_name,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      year: movie.year,
      quality: movie.quality,
      lang: movie.lang,
      episode_current: movie.episode_current,
    });
  };

  if (loading) return <LoadingSpinner />;
  if (!movie) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="film-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.errorText}>Không tìm thấy phim</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const posterUrl = getMovieImageUrl(movie.poster_url || movie.thumb_url);
  const thumbUrl = getMovieImageUrl(movie.thumb_url || movie.poster_url);
  const trailerUrl = movie.trailer_url || movie.trailerUrl || movie.trailer || '';

  const normalizedTrailerUrl = trailerUrl
    ? trailerUrl.startsWith('http')
      ? trailerUrl
      : `https://www.youtube.com/watch?v=${trailerUrl}`
    : '';

  const synopsis = movie.content || movie.description || '';
  const isFav = isFavorite(slug);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Background Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: thumbUrl }} style={styles.heroImage} resizeMode="cover" blurRadius={2} />
          <View style={styles.heroOverlay} />

          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Movie info overlay */}
          <View style={styles.heroContent}>
            <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
            <View style={styles.heroInfo}>
              <Text style={styles.movieName} numberOfLines={3}>{movie.name}</Text>
              {movie.origin_name && (
                <Text style={styles.originName} numberOfLines={2}>{movie.origin_name}</Text>
              )}
              <View style={styles.badgeRow}>
                {movie.quality && <Badge text={movie.quality} type="quality" />}
                {movie.lang && <Badge text={movie.lang} type="lang" />}
                {movie.year && <Badge text={`${movie.year}`} type="year" />}
              </View>
              {movie.episode_current && (
                <Text style={styles.episodeInfo}>{movie.episode_current} / {movie.episode_total || '?'}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.watchButton} onPress={handleWatch}>
            <Ionicons name="play-circle" size={20} color="#000" />
            <Text style={styles.watchButtonText}>Xem Phim</Text>
          </TouchableOpacity>

          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.actionIcon} onPress={handleFavorite}>
              <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? '#ef4444' : COLORS.text} />
              <Text style={styles.actionIconText}>Yêu thích</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color={COLORS.text} />
              <Text style={styles.actionIconText}>Chia sẻ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={() => {
                if (!user) { navigation.navigate('Login'); return; }
                navigation.navigate('WatchParty', { movieSlug: slug });
              }}
            >
              <Ionicons name="people-outline" size={22} color={COLORS.text} />
              <Text style={styles.actionIconText}>Xem chung</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        {movie.category?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.categoryChips}>
              {movie.category.map((cat, i) => (
                <Badge
                  key={i}
                  text={cat.name}
                  type="category"
                  onPress={() => navigation.navigate('CategoryDetail', {
                    describe: 'the-loai',
                    slug: cat.slug,
                    title: cat.name,
                  })}
                />
              ))}
            </View>
          </View>
        )}

        {/* Synopsis */}
        {synopsis ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nội dung phim</Text>
            <Text style={styles.synopsis} numberOfLines={showFullSynopsis ? undefined : 4}>
              {synopsis.replace(/<[^>]+>/g, '')}
            </Text>
            <TouchableOpacity onPress={() => setShowFullSynopsis(!showFullSynopsis)}>
              <Text style={styles.readMore}>
                {showFullSynopsis ? 'Thu gọn' : 'Xem thêm'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Tabs */}
        <View style={styles.tabs}>
          {['Tập phim', 'Trailer', 'Đề xuất'].map((tab, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.tab, activeTab === idx && styles.tabActive]}
              onPress={() => setActiveTab(idx)}
            >
              <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        {activeTab === 0 && (
          <View style={styles.section}>
            {/* Server selector */}
            {episodes.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serverRow}>
                {episodes.map((server, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.serverBtn, selectedServer === idx && styles.serverBtnActive]}
                    onPress={() => setSelectedServer(idx)}
                  >
                    <Text style={[styles.serverBtnText, selectedServer === idx && styles.serverBtnTextActive]}>
                      {server.server_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Episode list */}
            <View style={styles.episodeGrid}>
              {episodes[selectedServer]?.server_data?.map((ep, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.episodeBtn}
                  onPress={() => handleWatchEpisode(selectedServer, idx)}
                >
                  <Text style={styles.episodeBtnText} numberOfLines={1}>
                    {ep.name || `Tập ${idx + 1}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 1 && (
          <View style={styles.section}>
            {normalizedTrailerUrl ? (
              <TouchableOpacity
                style={styles.trailerBtn}
                onPress={() => {
                  // Open trailer in WebView or browser
                  navigation.navigate('WatchMovie', { slug, isTrailer: true, trailerUrl: normalizedTrailerUrl });
                }}
              >
                <Ionicons name="play-circle" size={48} color={COLORS.primary} />
                <Text style={styles.trailerBtnText}>Xem Trailer</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.noContent}>Chưa có trailer</Text>
            )}
          </View>
        )}

        {activeTab === 2 && (
          <View style={styles.section}>
            {recommendLoading ? (
              <LoadingSpinner fullScreen={false} text="Đang tải đề xuất..." />
            ) : recommendedMovies.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recommendedMovies.map((item, idx) => (
                  <View key={`${item.slug || idx}`} style={styles.recommendItem}>
                    <MovieCard
                      movie={item}
                      onPress={() => navigation.push('MovieDetail', { slug: item.slug })}
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noContent}>Chưa có phim đề xuất</Text>
            )}
          </View>
        )}

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
  heroContainer: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,15,35,0.75)',
  },
  backButton: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heroContent: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
  },
  poster: {
    width: 120,
    height: 170,
    borderRadius: RADIUS.md,
  },
  heroInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'flex-end',
  },
  movieName: {
    color: COLORS.text,
    fontSize: FONTS.xxl,
    fontWeight: '800',
  },
  originName: {
    color: COLORS.textSecondary,
    fontSize: FONTS.md,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  episodeInfo: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    marginTop: 4,
  },
  // Actions
  actions: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: 8,
  },
  watchButtonText: {
    color: '#000',
    fontSize: FONTS.lg,
    fontWeight: '700',
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  actionIcon: {
    alignItems: 'center',
  },
  actionIconText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    marginTop: 4,
  },
  // Section
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
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  synopsis: {
    color: COLORS.textSecondary,
    fontSize: FONTS.md,
    lineHeight: 22,
  },
  readMore: {
    color: COLORS.primary,
    fontSize: FONTS.md,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: FONTS.md,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  // Server
  serverRow: {
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
  // Episodes
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
  episodeBtnText: {
    color: COLORS.text,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  // Trailer
  trailerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
  },
  trailerBtnText: {
    color: COLORS.primary,
    fontSize: FONTS.lg,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  noContent: {
    color: COLORS.textMuted,
    fontSize: FONTS.md,
    textAlign: 'center',
    padding: SPACING.xxl,
  },
  recommendItem: {
    marginRight: SPACING.sm,
  },
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.textMuted,
    fontSize: FONTS.lg,
    marginTop: SPACING.md,
  },
  backBtn: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
  },
  backBtnText: {
    color: '#000',
    fontWeight: '700',
  },
});
