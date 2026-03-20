import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MovieCard from '../../components/Movie/MovieCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMoviesByCategory, getMoviesByCountry, getMoviesByType } from '../../services/movieApi';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function CategoryDetailScreen({ route, navigation }) {
  const { describe, slug, typeList, title: routeTitle } = route.params || {};
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState(routeTitle || '');

  const fetchMovies = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      let res;
      if (typeList) {
        res = await getMoviesByType(typeList, pageNum, 24);
      } else if (describe === 'the-loai') {
        res = await getMoviesByCategory(slug, pageNum, 24);
      } else if (describe === 'quoc-gia') {
        res = await getMoviesByCountry(slug, pageNum, 24);
      }

      const payload = res?.data || res || {};
      const items = payload?.items || payload?.data?.items || [];
      const pagination =
        payload?.params?.pagination ||
        payload?.data?.params?.pagination ||
        payload?.pagination ||
        {};

      if (!title && (payload?.titlePage || payload?.data?.titlePage)) {
        setTitle(payload.titlePage || payload.data.titlePage);
      }

      setTotalPages(
        pagination.totalPages ||
          Math.ceil((pagination.totalItems || items.length || 0) / 24) ||
          1
      );
      setMovies((prev) => (append ? [...prev, ...items] : items));
    } catch (err) {
      console.error('Fetch category movies error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [describe, slug, typeList, title]);

  useEffect(() => {
    fetchMovies(1);
  }, [fetchMovies]);

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage, true);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <MovieCard
        movie={item}
        onPress={() => navigation.navigate('MovieDetail', { slug: item.slug })}
      />
    </View>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={movies}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.slug || `${index}`}
        numColumns={3}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ padding: 20 }} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="film-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Không có phim nào</Text>
          </View>
        }
      />
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
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    marginRight: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  cardWrapper: {
    flex: 1 / 3,
    paddingHorizontal: 3,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONTS.md,
    marginTop: SPACING.sm,
  },
});
