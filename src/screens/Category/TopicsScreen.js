import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAllGenres } from '../../services/movieApi';
import { CATEGORY_GRADIENTS } from '../../constants/movie';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function TopicsScreen({ navigation }) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getAllGenres();
        const filtered = (data || []).filter((cat) => cat.slug !== 'phim-18');
        setGenres(filtered);
      } catch (err) {
        console.error('Fetch genres error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  const renderItem = ({ item, index }) => {
    const gradientColors = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length];

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: gradientColors[0] }]}
        onPress={() =>
          navigation.navigate('CategoryDetail', {
            describe: 'the-loai',
            slug: item.slug,
            title: item.name,
          })
        }
        activeOpacity={0.8}
      >
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khám Phá Thế Giới Phim</Text>
      </View>

      <FlatList
        data={genres}
        renderItem={renderItem}
        keyExtractor={(item) => item.slug || item._id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    marginRight: SPACING.sm,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONTS.xxl,
    fontWeight: '800',
  },
  grid: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 4,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    minHeight: 70,
  },
  cardTitle: {
    color: '#fff',
    fontSize: FONTS.md,
    fontWeight: '700',
    flex: 1,
  },
});
