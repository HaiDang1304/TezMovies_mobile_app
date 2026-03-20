import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useUser } from './UserContext';
import { Alert } from 'react-native';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get('/api/favorites');
      setFavorites(res.data.favorites || res.data || []);
    } catch (err) {
      console.error('Fetch favorites error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addToFavorites = useCallback(async (movie) => {
    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }
    try {
      await apiClient.post('/api/favorites', { movie });
      await fetchFavorites();
      Alert.alert('Thành công', 'Đã thêm vào danh sách yêu thích');
    } catch (err) {
      console.error('Add favorite error:', err);
      Alert.alert('Lỗi', 'Không thể thêm vào yêu thích');
    }
  }, [user, fetchFavorites]);

  const removeFromFavorites = useCallback(async (slug) => {
    if (!user) return;
    try {
      await apiClient.delete(`/api/favorites/${slug}`);
      setFavorites((prev) => prev.filter((f) => f.slug !== slug));
    } catch (err) {
      console.error('Remove favorite error:', err);
    }
  }, [user]);

  const isFavorite = useCallback((slug) => {
    return favorites.some((f) => f.slug === slug || f.movie?.slug === slug);
  }, [favorites]);

  const toggleFavorite = useCallback(async (movie) => {
    const slug = movie.slug;
    if (isFavorite(slug)) {
      await removeFromFavorites(slug);
    } else {
      await addToFavorites(movie);
    }
  }, [isFavorite, removeFromFavorites, addToFavorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
        clearFavorites,
        favoritesCount: favorites.length,
        fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
