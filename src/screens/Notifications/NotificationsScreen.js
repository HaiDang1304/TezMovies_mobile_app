import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../context/NotificationContext';
import { useUser } from '../../context/UserContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function NotificationsScreen({ navigation }) {
  const { user } = useUser();
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thông Báo</Text>
        </View>
        <View style={styles.center}>
          <Ionicons name="notifications-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Đăng nhập để xem thông báo</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) return <LoadingSpinner />;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment': return 'chatbubble';
      case 'reply': return 'chatbubbles';
      case 'like': return 'heart';
      case 'system': return 'megaphone';
      default: return 'notifications';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notifItem, !item.read && styles.notifUnread]}
      onPress={() => {
        markAsRead(item._id);
        if (item.slug) {
          navigation.navigate('HomeTab', {
            screen: 'MovieDetail',
            params: { slug: item.slug },
          });
        }
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, !item.read && styles.iconCircleUnread]}>
        <Ionicons
          name={getNotificationIcon(item.type)}
          size={18}
          color={!item.read ? COLORS.primary : COLORS.textMuted}
        />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]} numberOfLines={2}>
          {item.title || item.message}
        </Text>
        {item.message && item.title && (
          <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
        )}
        <Text style={styles.notifDate}>{formatDate(item.createdAt)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông Báo</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.readAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="notifications-off-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Chưa có thông báo</Text>
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
  readAllText: { color: COLORS.primary, fontSize: FONTS.sm, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.md, marginTop: SPACING.md },
  loginBtn: {
    marginTop: SPACING.lg, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md, borderRadius: RADIUS.lg,
  },
  loginBtnText: { color: '#000', fontWeight: '700' },
  list: { paddingHorizontal: SPACING.lg },
  notifItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm,
  },
  notifUnread: { backgroundColor: COLORS.card, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  iconCircleUnread: { backgroundColor: 'rgba(255,211,105,0.15)' },
  notifContent: { flex: 1 },
  notifTitle: { color: COLORS.textSecondary, fontSize: FONTS.md, lineHeight: 20 },
  notifTitleUnread: { color: COLORS.text, fontWeight: '600' },
  notifMessage: { color: COLORS.textMuted, fontSize: FONTS.sm, marginTop: 2 },
  notifDate: { color: COLORS.textMuted, fontSize: FONTS.xs, marginTop: 4 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: SPACING.sm,
  },
});
