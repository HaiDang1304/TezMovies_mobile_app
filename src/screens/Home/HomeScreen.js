import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MovieSlider from '../../components/Movie/MovieSlider';
import MovieSection from '../../components/Movie/MovieSection';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMoviesByType, getNewMovies, getMoviesByCategory } from '../../services/movieApi';
import { COLORS, FONTS, SPACING } from '../../constants/config';

const TYPE_SECTIONS = [
  { key: 'phim-le', title: 'Phim Lẻ' },
  { key: 'phim-bo', title: 'Phim Bộ' },
  { key: 'hoat-hinh', title: 'Hoạt Hình' },
  { key: 'tv-shows', title: 'TV Shows' },
];

const FEATURED_GENRES = [
  { slug: 'hanh-dong', title: 'Hành Động' },
  { slug: 'vien-tuong', title: 'Viễn Tưởng' },
  { slug: 'bi-an', title: 'Bí Ẩn' },
  { slug: 'hai-huoc', title: 'Hài Hước' },
  { slug: 'lang-man', title: 'Lãng Mạn' },
  { slug: 'kinh-di', title: 'Kinh Dị' },
];

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sliderMovies, setSliderMovies] = useState([]);
  const [newMovies, setNewMovies] = useState([]);
  const [typeMovies, setTypeMovies] = useState({});
  const [genreMovies, setGenreMovies] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const [newRes, ...typeResponses] = await Promise.all([
        getNewMovies(1),
        ...TYPE_SECTIONS.map((section) => getMoviesByType(section.key, 1, 12)),
      ]);

      const genreResponses = await Promise.allSettled(
        FEATURED_GENRES.map((genre) => getMoviesByCategory(genre.slug, 1, 12))
      );

      setSliderMovies(newRes?.items?.slice(0, 10) || []);
      setNewMovies(newRes?.items?.slice(0, 12) || []);

      const nextTypeMovies = {};
      TYPE_SECTIONS.forEach((section, index) => {
        nextTypeMovies[section.key] = typeResponses[index]?.data?.items || [];
      });
      setTypeMovies(nextTypeMovies);

      const nextGenreMovies = {};
      FEATURED_GENRES.forEach((genre, index) => {
        const result = genreResponses[index];
        if (result?.status === 'fulfilled') {
          nextGenreMovies[genre.slug] = result.value?.data?.items || [];
        } else {
          nextGenreMovies[genre.slug] = [];
        }
      });
      setGenreMovies(nextGenreMovies);
    } catch (err) {
      console.error('Failed to fetch home data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const navigateToMovie = (movie) => {
    navigation.navigate('MovieDetail', { slug: movie.slug });
  };

  const navigateToCategory = (type, title) => {
    navigation.navigate('CategoryDetail', { typeList: type, title });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoTez}>Tez</Text>
          <Text style={styles.logoMovies}>Movies</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={styles.searchButton}
          >
            <Ionicons name="search" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Movie Slider */}
        <MovieSlider movies={sliderMovies} onMoviePress={navigateToMovie} />

        {/* Quick Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChips}
        >
          {[...TYPE_SECTIONS.map((item) => ({ key: item.key, label: item.title })),
            ...FEATURED_GENRES.map((item) => ({ key: item.slug, label: item.title, isGenre: true }))].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.chip}
              onPress={() => {
                if (item.isGenre) {
                  navigation.navigate('CategoryDetail', {
                    describe: 'the-loai',
                    slug: item.key,
                    title: item.label,
                  });
                  return;
                }
                navigateToCategory(item.key, item.label);
              }}
            >
              <Text style={styles.chipText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.chip, styles.chipOutline]}
            onPress={() => navigation.navigate('Topics')}
          >
            <Ionicons name="grid-outline" size={14} color={COLORS.primary} />
            <Text style={[styles.chipText, { color: COLORS.primary, marginLeft: 4 }]}>Chủ đề</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Phim Mới Cập Nhật */}
        <MovieSection
          title="Phim Mới Cập Nhật"
          movies={newMovies}
          onMoviePress={navigateToMovie}
          onSeeAll={() => navigateToCategory('phim-moi-cap-nhat', 'Phim Mới Cập Nhật')}
        />

        {TYPE_SECTIONS.map((section) => (
          <MovieSection
            key={section.key}
            title={section.title}
            movies={typeMovies[section.key] || []}
            onMoviePress={navigateToMovie}
            onSeeAll={() => navigateToCategory(section.key, section.title)}
          />
        ))}

        {FEATURED_GENRES.map((genre) => (
          <MovieSection
            key={genre.slug}
            title={genre.title}
            movies={genreMovies[genre.slug] || []}
            onMoviePress={navigateToMovie}
            onSeeAll={() =>
              navigation.navigate('CategoryDetail', {
                describe: 'the-loai',
                slug: genre.slug,
                title: genre.title,
              })
            }
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTez: {
    color: COLORS.text,
    fontSize: FONTS.xxxl,
    fontWeight: '800',
  },
  logoMovies: {
    color: '#ef4444',
    fontSize: FONTS.xxxl,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChips: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  chipOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
});
