import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu không khớp');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Thông báo', 'Email không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/api/auth/register', { name, email, password });
      Alert.alert('Thành công', res.data?.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.', [
        { text: 'Đăng nhập', onPress: () => navigation.replace('Login') },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký thất bại';
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <Text style={styles.logoTez}>Tez</Text>
            <Text style={styles.logoMovies}>Movies</Text>
          </View>

          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>
            Đã có tài khoản?{' '}
            <Text style={styles.link} onPress={() => navigation.replace('Login')}>
              Đăng Nhập Ngay
            </Text>
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor={COLORS.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerBtnText}>
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <Text style={styles.link}>Điều khoản sử dụng</Text> và{' '}
            <Text style={styles.link}>Chính sách bảo mật</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: SPACING.xxl, paddingTop: SPACING.xl, justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: SPACING.lg, right: SPACING.lg, zIndex: 10 },
  logoRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.xxxl },
  logoTez: { color: COLORS.text, fontSize: 36, fontWeight: '800' },
  logoMovies: { color: '#ef4444', fontSize: 36, fontWeight: '800' },
  title: { color: COLORS.text, fontSize: FONTS.xxxl, fontWeight: '800', marginBottom: SPACING.sm },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.md, marginBottom: SPACING.xxl },
  link: { color: COLORS.primary, fontWeight: '700' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md,
    height: 52, borderWidth: 1, borderColor: COLORS.border,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, color: COLORS.text, fontSize: FONTS.md },
  registerBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.sm,
  },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText: { color: '#000', fontSize: FONTS.lg, fontWeight: '700' },
  terms: { color: COLORS.textMuted, fontSize: FONTS.xs, textAlign: 'center', marginTop: SPACING.xl, lineHeight: 18 },
});
