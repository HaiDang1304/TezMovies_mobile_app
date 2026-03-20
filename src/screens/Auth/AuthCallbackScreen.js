import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useUser } from '../../context/UserContext';
import { COLORS, FONTS } from '../../constants/config';

export default function AuthCallbackScreen({ route, navigation }) {
  const { fetchUser } = useUser();
  const token = route.params?.token;

  useEffect(() => {
    const handleCallback = async () => {
      if (token) {
        await SecureStore.setItemAsync('token', token);
        await fetchUser();
      }
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    };
    handleCallback();
  }, [token]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>Đang xử lý đăng nhập...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  text: { color: COLORS.textSecondary, fontSize: FONTS.md, marginTop: 16 },
});
