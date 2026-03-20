import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MovieCard from '../../components/Movie/MovieCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { searchMovies } from '../../services/movieApi';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function SearchScreen({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) return;
    Keyboard.dismiss();
    try {
      setLoading(true);
      setSearched(true);
      const data = await searchMovies({ keyword: keyword.trim() });
      setResults(data?.data?.items || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <MovieCard
        movie={item}
        onPress={() => navigation.navigate('MovieDetail', { slug: item.slug })}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Tìm kiếm phim..."
            placeholderTextColor={COLORS.textMuted}
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => setKeyword('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {loading && <LoadingSpinner fullScreen={false} />}

      {!loading && searched && results.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <>
          <Text style={styles.resultCount}>
            Kết quả cho: "{keyword}" ({results.length} phim)
          </Text>
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.slug || `${index}`}
            numColumns={3}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {!searched && !loading && (
        <View style={styles.empty}>
          <Ionicons name="film-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Tìm kiếm phim yêu thích của bạn</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: 8,
  },
  backBtn: {
    marginRight: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    height: 42,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.md,
    marginLeft: SPACING.sm,
    height: '100%',
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
  },
  searchBtnText: {
    color: '#000',
    fontSize: FONTS.md,
    fontWeight: '700',
  },
  resultCount: {
    color: COLORS.textSecondary,
    fontSize: FONTS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  grid: {
    paddingHorizontal: SPACING.lg,
  },
  cardWrapper: {
    flex: 1 / 3,
    paddingHorizontal: 3,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONTS.md,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});
