import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';
import CachedImage from '../../components/common/CachedImage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function MovieCrawlerScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [crawlLogs, setCrawlLogs] = useState([]);
  const [crawlProgress, setCrawlProgress] = useState({ new: 0, skipped: 0 });
  const [crawlSettings, setCrawlSettings] = useState({ limit: 10, maxPages: 5, unlimitedPages: false });
  const [isCrawling, setIsCrawling] = useState(false);
  const logScrollRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, statusRes] = await Promise.all([
        apiClient.get('/api/crawl/stats').catch(() => ({ data: null })),
        apiClient.get('/api/crawl/checkIsCrawling').catch(() => ({ data: { isCrawling: false } })),
      ]);
      setStats(statsRes.data?.data || null);
      setIsCrawling(statusRes.data?.result?.isCrawling || false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, []);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    setSearching(true);
    try {
      const res = await apiClient.get('/api/crawl/search', { params: { keyword: searchKeyword.trim(), limit: 20 } });
      setSearchResults(res.data?.data?.items || []);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tìm kiếm');
    } finally {
      setSearching(false);
    }
  };

  const handleCrawlSingle = async (slug) => {
    try {
      Alert.alert('Đang crawl...', slug);
      await apiClient.post('/api/crawl/crawl-single', { slug });
      Alert.alert('Thành công', `Đã crawl: ${slug}`);
      fetchStats();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Crawl thất bại');
    }
  };

  const handleCrawlAll = async () => {
    Alert.alert('Crawl tất cả', 'Bắt đầu crawl tất cả phim?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Bắt đầu',
        onPress: async () => {
          setCrawling(true);
          setCrawlLogs([]);
          setCrawlProgress({ new: 0, skipped: 0 });
          try {
            await apiClient.post('/api/crawl/crawl-all', {
              limit: crawlSettings.limit,
              maxPages: crawlSettings.maxPages,
              unlimitedPages: crawlSettings.unlimitedPages,
            });
            // Note: SSE doesn't work natively in RN, so we treat this as a regular request
            addLog('info', 'Crawl đã hoàn thành');
            fetchStats();
          } catch (err) {
            addLog('error', err.response?.data?.message || 'Crawl lỗi');
          } finally {
            setCrawling(false);
          }
        },
      },
    ]);
  };

  const handleStopCrawl = async () => {
    try {
      await apiClient.post('/api/crawl/stop');
      Alert.alert('Thông báo', 'Đã gửi lệnh dừng crawl');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể dừng crawl');
    }
  };

  const handleClearAll = () => {
    Alert.alert('⚠️ Xóa tất cả phim', 'Hành động này không thể hoàn tác!', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa tất cả', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete('/api/crawl/clear-all');
            Alert.alert('Thành công', 'Đã xóa tất cả phim');
            fetchStats();
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể xóa');
          }
        },
      },
    ]);
  };

  const addLog = (type, msg) => {
    setCrawlLogs(prev => [...prev.slice(-99), { type, msg, time: new Date().toLocaleTimeString() }]);
  };

  if (loading) return <LoadingSpinner />;

  const totalMovies = stats?.total || 0;
  const byTypeStats = stats?.byType || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Movie Crawler</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor={COLORS.primary} />}
      >
        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Tổng phim: {totalMovies}</Text>
          {byTypeStats.map((item) => {
            const key = item.name || item._id || 'Unknown';
            const val = item.count || 0;
            const pct = totalMovies > 0 ? (val / totalMovies) * 100 : 0;
            return (
              <View key={key} style={styles.statRow}>
                <Text style={styles.statLabel}>{key}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
                </View>
                <Text style={styles.statValue}>{val} ({pct.toFixed(1)}%)</Text>
              </View>
            );
          })}
        </View>

        {/* Search Movies */}
        <Text style={styles.sectionTitle}>Tìm & Crawl phim</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm phim trên KKPhim..."
            placeholderTextColor={COLORS.textMuted}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchBtn} disabled={searching}>
            <Ionicons name={searching ? 'hourglass' : 'search'} size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map((item, i) => (
              <View key={i} style={styles.searchItem}>
                <CachedImage
                  uri={item.poster_url?.startsWith('http') ? item.poster_url : `https://phimimg.com/${item.poster_url}`}
                  style={styles.searchPoster}
                />
                <View style={styles.searchInfo}>
                  <Text style={styles.searchName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.searchMeta}>{item.year} • {item.type}</Text>
                </View>
                <TouchableOpacity
                  style={styles.crawlSingleBtn}
                  onPress={() => handleCrawlSingle(item.slug)}
                >
                  <Ionicons name="download-outline" size={18} color="#000" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Crawl Settings */}
        <Text style={styles.sectionTitle}>Cài đặt Crawl</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Items/page:</Text>
            <TextInput
              style={styles.settingInput}
              value={String(crawlSettings.limit)}
              onChangeText={v => setCrawlSettings(p => ({ ...p, limit: parseInt(v) || 10 }))}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Max pages:</Text>
            <TextInput
              style={styles.settingInput}
              value={String(crawlSettings.maxPages)}
              onChangeText={v => setCrawlSettings(p => ({ ...p, maxPages: parseInt(v) || 5 }))}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, crawling && { opacity: 0.5 }]}
            onPress={handleCrawlAll}
            disabled={crawling}
          >
            <Ionicons name="cloud-download" size={20} color="#000" />
            <Text style={styles.actionBtnText}>Crawl All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.stopBtn]} onPress={handleStopCrawl}>
            <Ionicons name="stop-circle" size={20} color="#fff" />
            <Text style={[styles.actionBtnText, { color: '#fff' }]}>Stop</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.clearBtn]} onPress={handleClearAll}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={[styles.actionBtnText, { color: '#fff' }]}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Log Viewer */}
        {crawlLogs.length > 0 && (
          <View style={styles.logViewer}>
            <Text style={styles.sectionTitle}>Logs</Text>
            <ScrollView ref={logScrollRef} style={styles.logScroll} onContentSizeChange={() => logScrollRef.current?.scrollToEnd()}>
              {crawlLogs.map((log, i) => (
                <Text key={i} style={[styles.logLine, log.type === 'error' && { color: '#ff6b6b' }, log.type === 'success' && { color: '#51cf66' }]}>
                  [{log.time}] {log.msg}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}
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
  // Stats
  statsCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg },
  statsTitle: { color: COLORS.primary, fontSize: FONTS.lg, fontWeight: '800', marginBottom: SPACING.md },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  statLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, width: 100 },
  progressBar: { flex: 1, height: 8, backgroundColor: COLORS.background, borderRadius: 4, marginHorizontal: SPACING.sm, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  statValue: { color: COLORS.text, fontSize: FONTS.xs, width: 100, textAlign: 'right' },
  // Search
  sectionTitle: { color: COLORS.text, fontSize: FONTS.lg, fontWeight: '700', marginTop: SPACING.xl, marginBottom: SPACING.md },
  searchRow: { flexDirection: 'row', marginBottom: SPACING.md },
  searchInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, height: 44,
    paddingHorizontal: SPACING.lg, color: COLORS.text, fontSize: FONTS.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchBtn: {
    marginLeft: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
  },
  searchResults: { marginBottom: SPACING.md },
  searchItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.sm, marginBottom: SPACING.xs,
  },
  searchPoster: { width: 45, height: 65, borderRadius: RADIUS.sm, marginRight: SPACING.sm },
  searchInfo: { flex: 1 },
  searchName: { color: COLORS.text, fontSize: FONTS.sm, fontWeight: '600' },
  searchMeta: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 2 },
  crawlSingleBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, width: 36, height: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  // Settings
  settingsCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  settingLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm },
  settingInput: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.sm, width: 80, height: 36,
    textAlign: 'center', color: COLORS.text, fontSize: FONTS.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  // Actions
  actionsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, gap: 6,
  },
  actionBtnText: { color: '#000', fontSize: FONTS.sm, fontWeight: '700' },
  stopBtn: { backgroundColor: '#ff6b6b' },
  clearBtn: { backgroundColor: '#e03131' },
  // Logs
  logViewer: { marginTop: SPACING.md },
  logScroll: { backgroundColor: '#111', borderRadius: RADIUS.lg, padding: SPACING.sm, maxHeight: 200 },
  logLine: { color: '#ccc', fontSize: 11, fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 18 },
});
