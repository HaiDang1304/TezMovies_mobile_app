import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MovieCard from './MovieCard';
import { COLORS, FONTS, SPACING } from '../../constants/config';

export default function MovieSection({ title, movies = [], onSeeAll, onMoviePress, horizontal = true }) {
  if (!movies.length) return null;

  const renderItem = ({ item }) => (
    <View style={horizontal ? styles.horizontalItem : undefined}>
      <MovieCard
        movie={item}
        onPress={() => onMoviePress?.(item)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} style={styles.seeAll}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {horizontal ? (
        <FlatList
          data={movies}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.slug || item._id || `${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      ) : (
        <View style={styles.grid}>
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.slug || movie._id || index}
              movie={movie}
              onPress={() => onMoviePress?.(movie)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: FONTS.xl,
    fontWeight: '700',
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: SPACING.lg,
  },
  horizontalItem: {
    marginRight: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
});
