import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [movieStats, setMovieStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [userRes, crawlRes] = await Promise.all([
        apiClient.get('/api/admin/stats'),
        apiClient.get('/api/crawl/stats').catch(() => ({ data: null })),
      ]);
      setStats(userRes.data?.stats || userRes.data || null);
      setMovieStats(crawlRes.data?.data || crawlRes.data || null);
    } catch (err) {
      console.error('Admin stats error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Tổng Users', value: stats?.totalUsers || 0, icon: 'people', color: '#4f8cff' },
    { label: 'Admins', value: stats?.totalAdmins || 0, icon: 'shield-checkmark', color: '#ff6b6b' },
    { label: 'Đã xác thực', value: stats?.totalVerified || 0, icon: 'checkmark-circle', color: '#51cf66' },
    { label: 'Mới (7 ngày)', value: stats?.recentUsers || 0, icon: 'trending-up', color: COLORS.primary },
  ];

  const movieByType = movieStats?.byType || [];
  const totalMovies = movieStats?.total || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
      >
        {/* User Stats */}
        <Text style={styles.sectionTitle}>Thống kê người dùng</Text>
        <View style={styles.statsGrid}>
          {statCards.map((card, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: card.color + '22' }]}>
                <Ionicons name={card.icon} size={24} color={card.color} />
              </View>
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Movie Stats */}
        {movieStats && (
          <>
            <Text style={styles.sectionTitle}>Thống kê phim</Text>
            <View style={styles.movieStatsCard}>
              <Text style={styles.totalMovies}>{totalMovies} phim</Text>
              {movieByType.map((item) => {
                const val = item.count || 0;
                const key = item.name || item._id || 'Unknown';
                const pct = totalMovies > 0 ? (val / totalMovies) * 100 : 0;
                return (
                  <View key={key} style={styles.movieStatRow}>
                    <Text style={styles.movieStatLabel}>{key}</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={styles.movieStatValue}>{val}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quản lý</Text>
        {[
          { label: 'Quản lý người dùng', icon: 'people-outline', screen: 'UserManagement', color: '#4f8cff' },
          { label: 'Quản lý phim (Crawler)', icon: 'film-outline', screen: 'MovieCrawler', color: '#ff6b6b' },
          { label: 'Thông báo & Bình luận', icon: 'notifications-outline', screen: 'AdminNotifications', color: '#51cf66' },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.actionCard}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.actionLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { color: COLORS.text, fontSize: FONTS.xl, fontWeight: '800' },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.lg, fontWeight: '700', marginBottom: SPACING.md, marginTop: SPACING.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statCard: {
    width: '48%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.lg, alignItems: 'center',
  },
  statIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  statValue: { color: COLORS.text, fontSize: FONTS.xxxl, fontWeight: '800' },
  statLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginTop: 4 },
  movieStatsCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg },
  totalMovies: { color: COLORS.primary, fontSize: FONTS.xl, fontWeight: '800', marginBottom: SPACING.md },
  movieStatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  movieStatLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, width: 100 },
  progressBar: { flex: 1, height: 8, backgroundColor: COLORS.background, borderRadius: 4, marginHorizontal: SPACING.sm, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  movieStatValue: { color: COLORS.text, fontSize: FONTS.sm, fontWeight: '600', width: 50, textAlign: 'right' },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.sm,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  actionLabel: { flex: 1, color: COLORS.text, fontSize: FONTS.md, fontWeight: '600' },
});
