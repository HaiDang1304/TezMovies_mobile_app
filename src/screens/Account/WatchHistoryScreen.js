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
import { useWatchHistory } from '../../context/WatchHistoryContext';
import { useUser } from '../../context/UserContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';
import { getMovieImageUrl } from '../../services/imageUrl';

export default function WatchHistoryScreen({ navigation }) {
  const { user } = useUser();
  const { histories, loading, removeFromWatchHistory, clearAllWatchHistory } = useWatchHistory();

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch Sử Xem</Text>
        </View>
        <View style={styles.center}>
          <Ionicons name="time-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Đăng nhập để xem lịch sử</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) return <LoadingSpinner />;

  const handleClearAll = () => {
    Alert.alert('Xóa tất cả', 'Bạn muốn xóa toàn bộ lịch sử xem?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa hết', style: 'destructive', onPress: () => clearAllWatchHistory() },
    ]);
  };

  const renderItem = ({ item }) => {
    const posterUrl = getMovieImageUrl(item.poster_url || item.thumb_url);

    return (
      <TouchableOpacity
        style={styles.movieCard}
        onPress={() => navigation.navigate('WatchMovie', {
          slug: item.slug,
          serverIndex: item.server_index || 0,
          episodeIndex: item.episode_index || 0,
        })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
        <View style={styles.movieInfo}>
          <Text style={styles.movieName} numberOfLines={2}>{item.name}</Text>
          {item.episode_name && (
            <Text style={styles.episodeName} numberOfLines={1}>
              Đang xem: {item.episode_name}
            </Text>
          )}
          {item.updatedAt && (
            <Text style={styles.date}>
              {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => {
            Alert.alert('Xóa', `Xóa "${item.name}" khỏi lịch sử?`, [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Xóa', style: 'destructive', onPress: () => removeFromWatchHistory(item.slug) },
            ]);
          }}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch Sử Xem</Text>
        {histories.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAllText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={histories}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.slug || item._id || `${index}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="time-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Chưa có lịch sử xem phim</Text>
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
  clearAllText: { color: COLORS.error, fontSize: FONTS.sm, fontWeight: '600' },
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
  poster: { width: 90, height: 120 },
  movieInfo: { flex: 1, padding: SPACING.sm, justifyContent: 'center' },
  movieName: { color: COLORS.text, fontSize: FONTS.md, fontWeight: '700', marginBottom: 4 },
  episodeName: { color: COLORS.primary, fontSize: FONTS.sm, marginBottom: 4 },
  date: { color: COLORS.textMuted, fontSize: FONTS.xs },
  removeBtn: { justifyContent: 'center', paddingHorizontal: SPACING.md },
});
