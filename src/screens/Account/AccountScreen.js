import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { useFavorites } from '../../context/FavoritesContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function AccountScreen({ navigation }) {
  const { user, logout } = useUser();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="person-circle-outline" size={80} color={COLORS.textMuted} />
          <Text style={styles.noUserTitle}>Chưa đăng nhập</Text>
          <Text style={styles.noUserSubtitle}>Đăng nhập để sử dụng đầy đủ tính năng</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerBtnText}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    { icon: 'person-outline', label: 'Hồ sơ', screen: 'Profile' },
    { icon: 'diamond-outline', label: 'Nâng cấp Prime', screen: 'PrimeSubscription' },
    { icon: 'heart-outline', label: 'Yêu thích', screen: 'Favorites', tab: 'FavoritesTab' },
    { icon: 'time-outline', label: 'Lịch sử xem', screen: 'WatchHistory', tab: 'HistoryTab' },
    { icon: 'people-outline', label: 'Watch Party', screen: 'WatchParty', root: true },
  ];

  const adminItems = user.role === 'admin' ? [
    { icon: 'shield-outline', label: 'Admin Dashboard', screen: 'AdminDashboard' },
    { icon: 'people-circle-outline', label: 'Quản lý người dùng', screen: 'UserManagement' },
    { icon: 'cloud-download-outline', label: 'Crawl phim', screen: 'MovieCrawler' },
    { icon: 'megaphone-outline', label: 'Thông báo admin', screen: 'AdminNotifications' },
  ] : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User info card */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: user.picture || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#000" />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.menuItem}
              onPress={() => {
                if (item.root) {
                  navigation.navigate(item.screen);
                } else if (item.tab) {
                  navigation.navigate(item.tab);
                } else {
                  navigation.navigate(item.screen);
                }
              }}
            >
              <Ionicons name={item.icon} size={22} color={COLORS.textSecondary} />
              <Text style={styles.menuItemText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Admin section */}
        {adminItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quản trị</Text>
            {adminItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Ionicons name={item.icon} size={22} color={COLORS.primary} />
                <Text style={styles.menuItemText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
  noUserTitle: { color: COLORS.text, fontSize: FONTS.xxl, fontWeight: '700', marginTop: SPACING.lg },
  noUserSubtitle: { color: COLORS.textSecondary, fontSize: FONTS.md, marginTop: SPACING.xs, marginBottom: SPACING.xl },
  loginBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxxl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg, marginBottom: SPACING.sm, width: '80%', alignItems: 'center',
  },
  loginBtnText: { color: '#000', fontSize: FONTS.lg, fontWeight: '700' },
  registerBtn: {
    borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.md, borderRadius: RADIUS.lg, width: '80%', alignItems: 'center',
  },
  registerBtnText: { color: COLORS.primary, fontSize: FONTS.lg, fontWeight: '700' },
  userCard: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.xl,
    marginHorizontal: SPACING.lg, marginTop: SPACING.lg, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: SPACING.lg },
  userInfo: { flex: 1 },
  userName: { color: COLORS.text, fontSize: FONTS.xl, fontWeight: '700' },
  userEmail: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginTop: 2 },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4, alignSelf: 'flex-start', gap: 4,
  },
  adminBadgeText: { color: '#000', fontSize: FONTS.xs, fontWeight: '700' },
  section: { marginTop: SPACING.xl, paddingHorizontal: SPACING.lg },
  sectionTitle: { color: COLORS.textMuted, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 1 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.lg,
    marginBottom: SPACING.xs,
  },
  menuItemText: { flex: 1, color: COLORS.text, fontSize: FONTS.md, fontWeight: '600', marginLeft: SPACING.md },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: SPACING.lg, marginTop: SPACING.xxl, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, gap: 8,
  },
  logoutText: { color: COLORS.error, fontSize: FONTS.md, fontWeight: '700' },
});
