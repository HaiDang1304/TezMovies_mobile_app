import React, { useState } from 'react';
import { Image as RNImage, View, StyleSheet } from 'react-native';

export default function CachedImage({ uri, style, resizeMode = 'cover', fallbackUri }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const imageUri = error && fallbackUri ? fallbackUri : uri;

  return (
    <View style={[styles.container, style]}>
      <RNImage
        source={{ uri: imageUri }}
        style={[StyleSheet.absoluteFill, { resizeMode }]}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
      />
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  placeholder: {
    backgroundColor: '#2a2a4a',
  },
});
