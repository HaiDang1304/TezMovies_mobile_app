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
  Switch,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

const NOTIFICATION_TYPES = ['info', 'update', 'warning', 'announcement', 'feature'];
const PRIORITIES = ['high', 'normal', 'low'];
const TYPE_ICONS = { info: 'information-circle', update: 'refresh-circle', warning: 'warning', announcement: 'megaphone', feature: 'star' };
const TYPE_COLORS = { info: '#4f8cff', update: '#51cf66', warning: '#fcc419', announcement: '#ff6b6b', feature: '#cc5de8' };

export default function AdminNotificationsScreen({ navigation }) {
  const [tab, setTab] = useState('notifications'); // 'notifications' | 'comments'

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [notifStats, setNotifStats] = useState(null);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifSearch, setNotifSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotif, setEditingNotif] = useState(null);

  // Create/Edit form
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formType, setFormType] = useState('info');
  const [formPriority, setFormPriority] = useState('normal');
  const [formActionUrl, setFormActionUrl] = useState('');
  const [formIsGlobal, setFormIsGlobal] = useState(true);
  const [formSendEmail, setFormSendEmail] = useState(false);

  // Comment state
  const [comments, setComments] = useState([]);
  const [commentStats, setCommentStats] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSearch, setCommentSearch] = useState('');
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [selectedComments, setSelectedComments] = useState([]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const [notRes, statsRes] = await Promise.all([
        apiClient.get('/api/notifications/admin/all'),
        apiClient.get('/api/notifications/admin/stats').catch(() => ({ data: null })),
      ]);
      setNotifications(notRes.data.notifications || notRes.data || []);
      setNotifStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Fetch comments
  const fetchComments = useCallback(async (p = 1) => {
    setCommentLoading(true);
    try {
      const params = { page: p, limit: 20 };
      if (commentSearch) params.search = commentSearch;
      const [commRes, statsRes] = await Promise.all([
        apiClient.get('/api/comments/admin/all', { params }),
        apiClient.get('/api/comments/admin/stats').catch(() => ({ data: null })),
      ]);
      setComments(commRes.data.comments || commRes.data || []);
      setCommentTotalPages(commRes.data.pagination?.totalPages || 1);
      setCommentPage(p);
      setCommentStats(statsRes.data);
    } catch (err) {
      console.error('Fetch comments error:', err?.message || err);
      if (err.response?.status === 403) {
        Alert.alert('Lỗi', 'Bạn không có quyền admin');
      } else if (err.response?.status === 401) {
        Alert.alert('Lỗi', 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      }
    } finally {
      setCommentLoading(false);
    }
  }, [commentSearch]);

  useEffect(() => {
    if (tab === 'notifications') fetchNotifications();
    else fetchComments(1);
  }, [tab, fetchNotifications, fetchComments]);

  // Notification actions
  const handleToggleActive = async (id) => {
    try {
      await apiClient.patch(`/api/notifications/admin/${id}/toggle-active`);
      fetchNotifications();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái');
    }
  };

  const handleDeleteNotif = (id) => {
    Alert.alert('Xóa thông báo', 'Bạn có chắc?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/api/notifications/admin/${id}`);
            fetchNotifications();
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể xóa');
          }
        },
      },
    ]);
  };

  const openEditModal = (notif) => {
    setEditingNotif(notif);
    setFormTitle(notif.title);
    setFormMessage(notif.message);
    setFormType(notif.type || 'info');
    setFormPriority(notif.priority || 'normal');
    setFormActionUrl(notif.actionUrl || '');
    setFormIsGlobal(notif.isGlobal !== false);
    setFormSendEmail(false);
    setShowCreateModal(true);
  };

  const openCreateModal = () => {
    setEditingNotif(null);
    setFormTitle('');
    setFormMessage('');
    setFormType('info');
    setFormPriority('normal');
    setFormActionUrl('');
    setFormIsGlobal(true);
    setFormSendEmail(false);
    setShowCreateModal(true);
  };

  const handleSaveNotif = async () => {
    if (!formTitle.trim() || !formMessage.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    const payload = {
      title: formTitle.trim(),
      message: formMessage.trim(),
      type: formType,
      priority: formPriority,
      actionUrl: formActionUrl || undefined,
      isGlobal: formIsGlobal,
      sendEmail: formSendEmail,
    };
    try {
      if (editingNotif) {
        await apiClient.put(`/api/notifications/admin/${editingNotif._id}`, payload);
      } else {
        await apiClient.post('/api/notifications/admin/create', payload);
      }
      setShowCreateModal(false);
      fetchNotifications();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể lưu');
    }
  };

  // Comment actions
  const handleDeleteComment = (id) => {
    Alert.alert('Xóa bình luận', 'Bạn có chắc?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/api/comments/admin/${id}`);
            fetchComments(commentPage);
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể xóa');
          }
        },
      },
    ]);
  };

  const handleBulkDelete = () => {
    if (selectedComments.length === 0) return;
    Alert.alert('Xóa hàng loạt', `Xóa ${selectedComments.length} bình luận?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete('/api/comments/admin/bulk', { data: { ids: selectedComments } });
            setSelectedComments([]);
            fetchComments(commentPage);
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể xóa');
          }
        },
      },
    ]);
  };

  const toggleSelect = (id) => {
    setSelectedComments(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Render notification item
  const renderNotif = ({ item }) => (
    <View style={styles.notifCard}>
      <View style={styles.notifHeader}>
        <Ionicons name={TYPE_ICONS[item.type] || 'notifications'} size={20} color={TYPE_COLORS[item.type] || COLORS.primary} />
        <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
        {item.priority === 'high' && <View style={styles.highBadge}><Text style={styles.highBadgeText}>HIGH</Text></View>}
      </View>
      <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
      <View style={styles.notifFooter}>
        <Text style={styles.notifMeta}>
          {item.isGlobal ? '🌐 Global' : '👤 User'} • {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
        <View style={styles.notifActions}>
          <Switch
            value={item.isActive !== false}
            onValueChange={() => handleToggleActive(item._id)}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }}
            thumbColor={item.isActive !== false ? COLORS.primary : COLORS.textMuted}
          />
          <TouchableOpacity onPress={() => openEditModal(item)} style={{ padding: 4 }}>
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteNotif(item._id)} style={{ padding: 4 }}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render comment item
  const renderComment = ({ item }) => (
    <View style={styles.commentCard}>
      <TouchableOpacity
        style={[styles.checkbox, selectedComments.includes(item._id) && styles.checkboxChecked]}
        onPress={() => toggleSelect(item._id)}
      >
        {selectedComments.includes(item._id) && <Ionicons name="checkmark" size={14} color="#000" />}
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <Text style={styles.commentUser}>{item.user?.name || 'Unknown'}</Text>
        <Text style={styles.commentText} numberOfLines={2}>{item.content || item.text}</Text>
        <Text style={styles.commentMeta}>
          {item.movieSlug || ''} • {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteComment(item._id)} style={{ padding: 8 }}>
        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo & BL</Text>
        {tab === 'notifications' && (
          <TouchableOpacity onPress={openCreateModal}>
            <Ionicons name="add-circle" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {tab === 'comments' && selectedComments.length > 0 && (
          <TouchableOpacity onPress={handleBulkDelete}>
            <Ionicons name="trash" size={24} color={COLORS.error} />
          </TouchableOpacity>
        )}
        {tab === 'comments' && selectedComments.length === 0 && <View style={{ width: 28 }} />}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'notifications' && styles.tabActive]}
          onPress={() => setTab('notifications')}
        >
          <Text style={[styles.tabText, tab === 'notifications' && styles.tabTextActive]}>Thông báo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'comments' && styles.tabActive]}
          onPress={() => setTab('comments')}
        >
          <Text style={[styles.tabText, tab === 'comments' && styles.tabTextActive]}>Bình luận</Text>
        </TouchableOpacity>
      </View>

      {tab === 'notifications' ? (
        <>
          {/* Notif Stats */}
          {notifStats && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow} contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: SPACING.sm }}>
              {[
                { label: 'Tổng', value: notifStats.totalNotifications || 0 },
                { label: 'Active', value: notifStats.activeNotifications || 0 },
                { label: 'Global', value: notifStats.globalNotifications || 0 },
                { label: 'Inactive', value: notifStats.inactiveNotifications || 0 },
              ].map((s, i) => (
                <View key={i} style={styles.miniStat}>
                  <Text style={styles.miniStatValue}>{s.value}</Text>
                  <Text style={styles.miniStatLabel}>{s.label}</Text>
                </View>
              ))}
            </ScrollView>
          )}
          <FlatList
            data={notifications}
            renderItem={renderNotif}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={notifLoading} onRefresh={fetchNotifications} tintColor={COLORS.primary} />}
            ListEmptyComponent={
              <View style={styles.empty}><Text style={styles.emptyText}>Chưa có thông báo</Text></View>
            }
          />
        </>
      ) : (
        <>
          {/* Comment Search */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm bình luận..."
              placeholderTextColor={COLORS.textMuted}
              value={commentSearch}
              onChangeText={setCommentSearch}
              onSubmitEditing={() => fetchComments(1)}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={() => fetchComments(1)} style={styles.searchBtn}>
              <Ionicons name="search" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {commentLoading ? <LoadingSpinner mode="inline" /> : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}><Text style={styles.emptyText}>Không có bình luận</Text></View>
              }
            />
          )}

          {commentTotalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                disabled={commentPage <= 1}
                onPress={() => fetchComments(commentPage - 1)}
                style={[styles.pageBtn, commentPage <= 1 && { opacity: 0.4 }]}
              >
                <Ionicons name="chevron-back" size={20} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.pageText}>{commentPage} / {commentTotalPages}</Text>
              <TouchableOpacity
                disabled={commentPage >= commentTotalPages}
                onPress={() => fetchComments(commentPage + 1)}
                style={[styles.pageBtn, commentPage >= commentTotalPages && { opacity: 0.4 }]}
              >
                <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Create/Edit Notification Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingNotif ? 'Chỉnh sửa' : 'Tạo thông báo'}</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.fieldLabel}>Tiêu đề *</Text>
              <TextInput style={styles.modalInput} value={formTitle} onChangeText={setFormTitle} placeholder="Tiêu đề" placeholderTextColor={COLORS.textMuted} />

              <Text style={styles.fieldLabel}>Nội dung *</Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                value={formMessage} onChangeText={setFormMessage}
                placeholder="Nội dung thông báo" placeholderTextColor={COLORS.textMuted}
                multiline
              />

              <Text style={styles.fieldLabel}>Loại</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.sm }}>
                {NOTIFICATION_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, formType === t && { backgroundColor: TYPE_COLORS[t] }]}
                    onPress={() => setFormType(t)}
                  >
                    <Text style={[styles.chipText, formType === t && { color: '#fff' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>Độ ưu tiên</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.sm }}>
                {PRIORITIES.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.chip, formPriority === p && { backgroundColor: COLORS.primary }]}
                    onPress={() => setFormPriority(p)}
                  >
                    <Text style={[styles.chipText, formPriority === p && { color: '#000' }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>Action URL</Text>
              <TextInput
                style={styles.modalInput}
                value={formActionUrl} onChangeText={setFormActionUrl}
                placeholder="https://..." placeholderTextColor={COLORS.textMuted}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Global (tất cả users)</Text>
                <Switch value={formIsGlobal} onValueChange={setFormIsGlobal}
                  trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }}
                  thumbColor={formIsGlobal ? COLORS.primary : COLORS.textMuted}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Gửi email</Text>
                <Switch value={formSendEmail} onValueChange={setFormSendEmail}
                  trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }}
                  thumbColor={formSendEmail ? COLORS.primary : COLORS.textMuted}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNotif}>
                <Text style={styles.saveBtnText}>{editingNotif ? 'Lưu thay đổi' : 'Tạo thông báo'}</Text>
              </TouchableOpacity>
            </ScrollView>
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
  headerTitle: { color: COLORS.text, fontSize: FONTS.xl, fontWeight: '800' },
  tabs: { flexDirection: 'row', marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 3 },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.md },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600' },
  tabTextActive: { color: '#000' },
  statsRow: { maxHeight: 60, marginBottom: SPACING.md },
  miniStat: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs, alignItems: 'center' },
  miniStatValue: { color: COLORS.primary, fontSize: FONTS.lg, fontWeight: '800' },
  miniStatLabel: { color: COLORS.textSecondary, fontSize: FONTS.xs },
  list: { paddingHorizontal: SPACING.lg },
  // Notification card
  notifCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
  notifTitle: { flex: 1, color: COLORS.text, fontSize: FONTS.md, fontWeight: '600' },
  highBadge: { backgroundColor: '#ff6b6b', borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 1 },
  highBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  notifMessage: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginBottom: SPACING.sm },
  notifFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifMeta: { color: COLORS.textMuted, fontSize: FONTS.xs },
  notifActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  // Comment card
  commentCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.sm, marginBottom: SPACING.xs,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm,
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  commentContent: { flex: 1 },
  commentUser: { color: COLORS.text, fontSize: FONTS.sm, fontWeight: '600' },
  commentText: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginTop: 2 },
  commentMeta: { color: COLORS.textMuted, fontSize: FONTS.xs, marginTop: 4 },
  // Search
  searchRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  searchInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, height: 44,
    paddingHorizontal: SPACING.lg, color: COLORS.text, fontSize: FONTS.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchBtn: {
    marginLeft: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
  },
  // Pagination
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.md },
  pageBtn: { padding: 8, backgroundColor: COLORS.surface, borderRadius: RADIUS.sm },
  pageText: { color: COLORS.textSecondary, fontSize: FONTS.sm },
  // Empty
  empty: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.md },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl, padding: SPACING.xxl, maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { color: COLORS.text, fontSize: FONTS.xl, fontWeight: '700' },
  fieldLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.xs, marginTop: SPACING.sm },
  modalInput: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg,
    height: 48, color: COLORS.text, fontSize: FONTS.md, borderWidth: 1, borderColor: COLORS.border,
  },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, backgroundColor: COLORS.background,
    borderRadius: RADIUS.full, marginRight: SPACING.xs,
  },
  chipText: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md },
  switchLabel: { color: COLORS.text, fontSize: FONTS.md },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.xl },
  saveBtnText: { color: '#000', fontSize: FONTS.lg, fontWeight: '700' },
});
