import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../context/FavoritesContext';
import { useUser } from '../../context/UserContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';
import { getMovieImageUrl } from '../../services/imageUrl';

export default function FavoritesScreen({ navigation }) {
  const { user } = useUser();
  const { favorites, loading, removeFromFavorites } = useFavorites();

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Yêu Thích</Text>
        </View>
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Đăng nhập để xem danh sách yêu thích</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) return <LoadingSpinner />;

  const handleRemove = (slug, name) => {
    Alert.alert('Xóa khỏi yêu thích', `Bạn muốn xóa "${name}" khỏi danh sách yêu thích?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => removeFromFavorites(slug) },
    ]);
  };

  const renderItem = ({ item }) => {
    const movie = item.movie || item;
    const posterUrl = getMovieImageUrl(movie.poster_url || movie.thumb_url);

    return (
      <TouchableOpacity
        style={styles.movieCard}
        onPress={() => navigation.navigate('MovieDetail', { slug: movie.slug })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
        <View style={styles.movieInfo}>
          <Text style={styles.movieName} numberOfLines={2}>{movie.name}</Text>
          {movie.origin_name && (
            <Text style={styles.originName} numberOfLines={1}>{movie.origin_name}</Text>
          )}
          <View style={styles.badgeRow}>
            {movie.quality && <Badge text={movie.quality} type="quality" small />}
            {movie.lang && <Badge text={movie.lang} type="lang" small />}
          </View>
          {movie.year && <Text style={styles.year}>{movie.year}</Text>}
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemove(movie.slug, movie.name)}
        >
          <Ionicons name="heart-dislike" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu Thích</Text>
        <Text style={styles.count}>{favorites.length} phim</Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.slug || item._id || `${index}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="heart-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Chưa có phim yêu thích</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { color: COLORS.text, fontSize: FONTS.xxl, fontWeight: '800' },
  count: { color: COLORS.textSecondary, fontSize: FONTS.sm },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.md, marginTop: SPACING.md },
  loginBtn: {
    marginTop: SPACING.lg, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md, borderRadius: RADIUS.lg,
  },
  loginBtnText: { color: '#000', fontWeight: '700' },
  list: { paddingHorizontal: SPACING.lg },
  movieCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    overflow: 'hidden', marginBottom: SPACING.sm,
  },
  poster: { width: 90, height: 130 },
  movieInfo: { flex: 1, padding: SPACING.sm, justifyContent: 'center' },
  movieName: { color: COLORS.text, fontSize: FONTS.md, fontWeight: '700', marginBottom: 4 },
  originName: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  year: { color: COLORS.textMuted, fontSize: FONTS.xs },
  removeBtn: { justifyContent: 'center', paddingHorizontal: SPACING.md },
});
