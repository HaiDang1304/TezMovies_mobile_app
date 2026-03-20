import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Badge from '../common/Badge';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';
import { getMovieImageUrl } from '../../services/imageUrl';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.sm * 2) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

export default function MovieCard({ movie, onPress, horizontal = false }) {
  if (!movie) return null;

  const posterUrl = movie.poster_url || movie.thumb_url || '';
  const fullPosterUrl = getMovieImageUrl(posterUrl);

  const quality = movie.quality || '';
  const lang = movie.lang || '';
  const episodeCurrent = movie.episode_current || '';
  const name = movie.name || movie.origin_name || '';

  if (horizontal) {
    return (
      <TouchableOpacity style={styles.horizontalCard} onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri: fullPosterUrl }} style={styles.horizontalPoster} resizeMode="cover" />
        <View style={styles.horizontalInfo}>
          <Text style={styles.horizontalTitle} numberOfLines={2}>{name}</Text>
          {movie.origin_name && (
            <Text style={styles.horizontalSubtitle} numberOfLines={1}>{movie.origin_name}</Text>
          )}
          <View style={styles.badgeRow}>
            {quality ? <Badge text={quality} type="quality" small /> : null}
            {lang ? <Badge text={lang} type="lang" small /> : null}
            {episodeCurrent ? <Badge text={episodeCurrent} type="episode" small /> : null}
          </View>
          {movie.year && <Text style={styles.year}>{movie.year}</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.posterContainer}>
        <Image source={{ uri: fullPosterUrl }} style={styles.poster} resizeMode="cover" />
        <View style={styles.overlay}>
          <View style={styles.topBadges}>
            {quality ? <Badge text={quality} type="quality" small /> : null}
          </View>
          <View style={styles.bottomBadges}>
            {lang ? <Badge text={lang} type="lang" small /> : null}
            {episodeCurrent ? <Badge text={episodeCurrent} type="episode" small /> : null}
          </View>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: SPACING.md,
  },
  posterContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 4,
  },
  topBadges: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bottomBadges: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  title: {
    color: COLORS.text,
    fontSize: FONTS.sm,
    fontWeight: '600',
    marginTop: SPACING.xs,
    lineHeight: 16,
  },
  // Horizontal card styles
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  horizontalPoster: {
    width: 100,
    height: 140,
  },
  horizontalInfo: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  horizontalTitle: {
    color: COLORS.text,
    fontSize: FONTS.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  horizontalSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  year: {
    color: COLORS.textMuted,
    fontSize: FONTS.xs,
  },
});
