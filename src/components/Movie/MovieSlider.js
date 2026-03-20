import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';
import { getMovieImageUrl } from '../../services/imageUrl';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - SPACING.lg * 2;
const SLIDE_HEIGHT = SLIDE_WIDTH * 0.55;

export default function MovieSlider({ movies = [], onMoviePress }) {
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % movies.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex, movies.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const renderItem = ({ item }) => {
    const thumbUrl = item.thumb_url || item.poster_url || '';
    const fullUrl = getMovieImageUrl(thumbUrl);

    return (
      <TouchableOpacity
        style={styles.slide}
        activeOpacity={0.9}
        onPress={() => onMoviePress?.(item)}
      >
        <Image source={{ uri: fullUrl }} style={styles.slideImage} resizeMode="cover" />
        <View style={styles.slideOverlay}>
          <View style={styles.slideContent}>
            <Text style={styles.slideName} numberOfLines={2}>{item.name}</Text>
            {item.origin_name && (
              <Text style={styles.slideOriginName} numberOfLines={1}>{item.origin_name}</Text>
            )}
            <View style={styles.slideInfo}>
              {item.year && <Text style={styles.slideYear}>{item.year}</Text>}
              {item.quality && (
                <View style={styles.qualityBadge}>
                  <Text style={styles.qualityText}>{item.quality}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!movies.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={movies.slice(0, 10)}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.slug || `${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SLIDE_WIDTH + SPACING.sm}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({
          length: SLIDE_WIDTH + SPACING.sm,
          offset: (SLIDE_WIDTH + SPACING.sm) * index,
          index,
        })}
      />
      {/* Pagination dots */}
      <View style={styles.dots}>
        {movies.slice(0, 10).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  slide: {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  slideContent: {
    padding: SPACING.lg,
  },
  slideName: {
    color: '#fff',
    fontSize: FONTS.xxl,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  slideOriginName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONTS.md,
    marginTop: 2,
  },
  slideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: 8,
  },
  slideYear: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  qualityBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qualityText: {
    color: '#fff',
    fontSize: FONTS.xs,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
});
