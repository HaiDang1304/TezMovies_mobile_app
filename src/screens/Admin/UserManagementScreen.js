import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';
import CachedImage from '../../components/common/CachedImage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function UserManagementScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async (p = 1) => {
    try {
      const params = { page: p, limit: 20 };
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      const res = await apiClient.get('/api/admin/users', { params });
      setUsers(res.data.users || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setPage(p);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(1); }, [roleFilter]);

  const handleSearch = () => fetchUsers(1);

  const handleChangeRole = (userId, userName, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    Alert.alert(
      'Thay đổi quyền',
      `Đổi quyền ${userName} thành ${newRole}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await apiClient.put(`/api/admin/users/${userId}/role`, { role: newRole });
              fetchUsers(page);
            } catch (err) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể thay đổi quyền');
            }
          },
        },
      ]
    );
  };

  const handleVerify = async (userId) => {
    try {
      await apiClient.put(`/api/admin/users/${userId}/verify`);
      fetchUsers(page);
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể xác thực');
    }
  };

  const handleDelete = (userId, userName) => {
    Alert.alert('Xóa người dùng', `Xóa ${userName}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/api/admin/users/${userId}`);
            fetchUsers(page);
          } catch (err) {
            Alert.alert('Lỗi', err.response?.data?.message || 'Không thể xóa');
          }
        },
      },
    ]);
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <CachedImage
          uri={item.picture}
          style={styles.avatar}
          fallbackIcon="person"
        />
        <View style={styles.userDetails}>
          <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
          <View style={styles.userMeta}>
            <View style={[styles.roleBadge, item.role === 'admin' && styles.adminBadge]}>
              <Text style={[styles.roleText, item.role === 'admin' && styles.adminRoleText]}>{item.role}</Text>
            </View>
            {item.isVerified ? (
              <Ionicons name="checkmark-circle" size={16} color={COLORS.accentGreen} />
            ) : (
              <TouchableOpacity onPress={() => handleVerify(item._id)}>
                <Text style={styles.verifyBtn}>Xác thực</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          onPress={() => handleChangeRole(item._id, item.name, item.role)}
          style={styles.actionBtn}
        >
          <Ionicons name="swap-horizontal" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item._id, item.name)}
          style={styles.actionBtn}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Users</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên hoặc email..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
          <Ionicons name="search" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Role Filter */}
      <View style={styles.filterRow}>
        {['all', 'user', 'admin'].map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.filterChip, roleFilter === r && styles.filterChipActive]}
            onPress={() => setRoleFilter(r)}
          >
            <Text style={[styles.filterChipText, roleFilter === r && styles.filterChipTextActive]}>
              {r === 'all' ? 'Tất cả' : r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(1); }} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
          </View>
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={page <= 1}
            onPress={() => fetchUsers(page - 1)}
            style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
          >
            <Ionicons name="chevron-back" size={20} color={page <= 1 ? COLORS.textMuted : COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.pageText}>{page} / {totalPages}</Text>
          <TouchableOpacity
            disabled={page >= totalPages}
            onPress={() => fetchUsers(page + 1)}
            style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
          >
            <Ionicons name="chevron-forward" size={20} color={page >= totalPages ? COLORS.textMuted : COLORS.text} />
          </TouchableOpacity>
        </View>
      )}
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
  searchRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  searchInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, height: 44,
    paddingHorizontal: SPACING.lg, color: COLORS.text, fontSize: FONTS.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchBtn: {
    marginLeft: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md, gap: SPACING.xs },
  filterChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
  },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipText: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600' },
  filterChipTextActive: { color: '#000' },
  list: { paddingHorizontal: SPACING.lg },
  userCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: SPACING.md },
  userDetails: { flex: 1 },
  userName: { color: COLORS.text, fontSize: FONTS.md, fontWeight: '600' },
  userEmail: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 2 },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  roleBadge: { backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.sm },
  adminBadge: { backgroundColor: '#ff6b6b22' },
  roleText: { color: COLORS.textSecondary, fontSize: FONTS.xs, fontWeight: '600' },
  adminRoleText: { color: '#ff6b6b' },
  verifyBtn: { color: COLORS.primary, fontSize: FONTS.xs, fontWeight: '600' },
  userActions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { padding: 8 },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { color: COLORS.textMuted, marginTop: SPACING.md },
  pagination: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: SPACING.md, gap: SPACING.md,
  },
  pageBtn: { padding: 8, backgroundColor: COLORS.surface, borderRadius: RADIUS.sm },
  pageBtnDisabled: { opacity: 0.4 },
  pageText: { color: COLORS.textSecondary, fontSize: FONTS.sm },
});
