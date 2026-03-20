import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../constants/config';

export default function Badge({ text, type = 'default', icon, onPress, small = false }) {
  const badgeStyle = [
    styles.badge,
    small && styles.badgeSmall,
    type === 'quality' && styles.quality,
    type === 'lang' && styles.lang,
    type === 'episode' && styles.episode,
    type === 'year' && styles.year,
    type === 'category' && styles.category,
    type === 'success' && styles.success,
    type === 'warning' && styles.warning,
    type === 'error' && styles.error,
  ];

  const textStyle = [
    styles.text,
    small && styles.textSmall,
    type === 'quality' && styles.qualityText,
  ];

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={badgeStyle} onPress={onPress} activeOpacity={0.7}>
      {icon && <Ionicons name={icon} size={small ? 10 : 12} color="#fff" style={{ marginRight: 4 }} />}
      <Text style={textStyle} numberOfLines={1}>{text}</Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    marginRight: 4,
    marginBottom: 4,
  },
  badgeSmall: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  text: {
    color: '#fff',
    fontSize: FONTS.xs,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 9,
  },
  quality: {
    backgroundColor: '#ef4444',
  },
  qualityText: {
    fontWeight: '700',
  },
  lang: {
    backgroundColor: '#3b82f6',
  },
  episode: {
    backgroundColor: '#8b5cf6',
  },
  year: {
    backgroundColor: '#14b8a6',
  },
  category: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  success: {
    backgroundColor: '#22c55e',
  },
  warning: {
    backgroundColor: '#f59e0b',
  },
  error: {
    backgroundColor: '#ef4444',
  },
});
