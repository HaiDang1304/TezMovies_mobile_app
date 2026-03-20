import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../../context/UserContext';
import apiClient from '../../services/apiClient';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function ProfileScreen({ navigation }) {
  const { user, fetchUser } = useUser();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Tên không được để trống');
      return;
    }
    try {
      setLoading(true);
      await apiClient.put('/api/user/profile', { name: name.trim() });
      await fetchUser();
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const formData = new FormData();
        const uri = result.assets[0].uri;
        formData.append('avatar', {
          uri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        });

        await apiClient.post('/api/user/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        await fetchUser();
        Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật ảnh đại diện');
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={handleChangeAvatar}>
          <Image
            source={{ uri: user.picture || 'https://via.placeholder.com/120' }}
            style={styles.avatar}
          />
          <View style={styles.editAvatarBtn}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Tên hiển thị</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Email (readonly) */}
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.input, styles.inputDisabled]}>
            <Text style={styles.inputDisabledText}>{user.email}</Text>
          </View>
        </View>

        {/* Role */}
        <View style={styles.field}>
          <Text style={styles.label}>Vai trò</Text>
          <View style={[styles.input, styles.inputDisabled]}>
            <Text style={styles.inputDisabledText}>{user.role || 'user'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Text>
        </TouchableOpacity>
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
  headerTitle: { color: COLORS.text, fontSize: FONTS.xl, fontWeight: '700' },
  content: { padding: SPACING.xxl, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: SPACING.xxl },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: COLORS.primary },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  field: { width: '100%', marginBottom: SPACING.lg },
  label: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg,
    height: 48, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text, fontSize: FONTS.md,
    justifyContent: 'center',
  },
  inputDisabled: { opacity: 0.6 },
  inputDisabledText: { color: COLORS.textMuted, fontSize: FONTS.md },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md,
    width: '100%', alignItems: 'center', marginTop: SPACING.sm,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#000', fontSize: FONTS.lg, fontWeight: '700' },
});
