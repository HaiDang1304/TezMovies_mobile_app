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
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useUser } from '../../context/UserContext';
import apiClient from '../../services/apiClient';
import { API_URL, COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { fetchUser, setUser } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Thông báo', 'Email không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/api/auth/login', { email, password });
      if (res.data?.token) {
        await SecureStore.setItemAsync('token', res.data.token);
        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          await fetchUser();
        }
        navigation.goBack();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại';
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // In Expo Go this becomes exp://.../--/auth/callback; in standalone it uses tezmovies://auth/callback.
      const redirectUri = Linking.createURL('auth/callback');
      const authUrl = `${API_URL}/auth/google?state=${encodeURIComponent(redirectUri)}`;

      // Use app deep-link callback so OAuth always returns to mobile app.
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );

      if (result.type === 'success' && result.url) {
        // Extract token from the redirect URL
        const tokenMatch = result.url.match(/[?&]token=([^&]+)/);
        if (tokenMatch && tokenMatch[1]) {
          const token = decodeURIComponent(tokenMatch[1]);
          await SecureStore.setItemAsync('token', token);
          await fetchUser();
          navigation.goBack();
          return;
        }
      }

    } catch (err) {
      console.error('Google login error:', err);
      Alert.alert('Lỗi', 'Đăng nhập Google thất bại. Hãy thử đăng nhập bằng email.');
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
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoRow}>
            <Text style={styles.logoTez}>Tez</Text>
            <Text style={styles.logoMovies}>Movies</Text>
          </View>

          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>
            Chưa có tài khoản?{' '}
            <Text
              style={styles.link}
              onPress={() => {
                navigation.replace('Register');
              }}
            >
              Đăng Ký Ngay
            </Text>
          </Text>

          {/* Email */}
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
              autoCorrect={false}
            />
          </View>

          {/* Password */}
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
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login */}
          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.googleBtnText}>Đăng nhập với Google</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xl,
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoTez: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '800',
  },
  logoMovies: {
    color: '#ef4444',
    fontSize: 36,
    fontWeight: '800',
  },
  title: {
    color: COLORS.text,
    fontSize: FONTS.xxxl,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.md,
    marginBottom: SPACING.xxl,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.md,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#000',
    fontSize: FONTS.lg,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sm,
    marginHorizontal: SPACING.md,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  googleBtnText: {
    color: COLORS.text,
    fontSize: FONTS.md,
    fontWeight: '600',
  },
});
