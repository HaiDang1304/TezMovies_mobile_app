import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function VerifyScreen({ route, navigation }) {
  const { token } = route.params || {};
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await apiClient.get(`/api/auth/verify/${token}`);
        setStatus('success');
        setMessage(res.data?.message || 'Xác thực thành công!');
        setTimeout(() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] }), 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Xác thực thất bại');
      }
    };
    if (token) verify();
    else { setStatus('error'); setMessage('Token không hợp lệ'); }
  }, [token]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        {status === 'verifying' && (
          <>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.title}>Đang xác thực...</Text>
          </>
        )}
        {status === 'success' && (
          <>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={40} color={COLORS.success} />
            </View>
            <Text style={styles.title}>Thành công!</Text>
            <Text style={styles.message}>{message}</Text>
          </>
        )}
        {status === 'error' && (
          <>
            <View style={[styles.iconCircle, { borderColor: COLORS.error }]}>
              <Ionicons name="close" size={40} color={COLORS.error} />
            </View>
            <Text style={styles.title}>Lỗi</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
            >
              <Text style={styles.btnText}>Về trang chủ</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xxxl,
    alignItems: 'center', width: '85%',
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: COLORS.success,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg,
  },
  title: { color: COLORS.text, fontSize: FONTS.xxl, fontWeight: '700', marginTop: SPACING.md, marginBottom: SPACING.sm },
  message: { color: COLORS.textSecondary, fontSize: FONTS.md, textAlign: 'center' },
  btn: {
    marginTop: SPACING.xl, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md, borderRadius: RADIUS.lg,
  },
  btnText: { color: '#000', fontWeight: '700', fontSize: FONTS.md },
});
