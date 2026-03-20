import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../constants/config';

export default function LoadingSpinner({ text = 'Đang tải...', size = 'large', fullScreen = true }) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={COLORS.primary} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={COLORS.primary} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  inline: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.textSecondary,
    marginTop: 12,
    fontSize: FONTS.md,
  },
});
