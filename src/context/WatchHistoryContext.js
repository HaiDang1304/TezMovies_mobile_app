import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useUser } from './UserContext';

const WatchHistoryContext = createContext();

export const WatchHistoryProvider = ({ children }) => {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const { user } = useUser();

  const fetchWatchHistory = useCallback(async (page = 1, limit = 20) => {
    if (!user) {
      setHistories([]);
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get('/api/watch-history', {
        params: { page, limit },
      });
      setHistories(res.data.histories || res.data || []);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Fetch watch history error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWatchHistory();
  }, [fetchWatchHistory]);

  const addToWatchHistory = useCallback(async (historyData) => {
    if (!user) return;
    try {
      const payload = {
        slug: historyData.slug,
        movieName: historyData.movieName || historyData.name || '',
        posterUrl: historyData.posterUrl || historyData.poster_url || '',
        thumbUrl: historyData.thumbUrl || historyData.thumb_url || '',
        episodeName: historyData.episodeName || historyData.episode_name || 'Full',
        episodeId: historyData.episodeId || historyData.episode_slug || '',
        serverIndex:
          historyData.serverIndex !== undefined
            ? historyData.serverIndex
            : (historyData.server_index || 0),
        currentTime:
          historyData.currentTime !== undefined
            ? historyData.currentTime
            : (historyData.current_time || 0),
        duration: historyData.duration || 0,
      };

      await apiClient.post('/api/watch-history', payload);
    } catch (err) {
      console.error('Add watch history error:', err);
    }
  }, [user]);

  const removeFromWatchHistory = useCallback(async (slug) => {
    if (!user) return;
    try {
      await apiClient.delete(`/api/watch-history/${slug}`);
      setHistories((prev) => prev.filter((h) => h.slug !== slug));
    } catch (err) {
      console.error('Remove watch history error:', err);
    }
  }, [user]);

  const clearAllWatchHistory = useCallback(async () => {
    if (!user) return;
    try {
      await apiClient.delete('/api/watch-history');
      setHistories([]);
    } catch (err) {
      console.error('Clear watch history error:', err);
    }
  }, [user]);

  const getMovieWatchHistory = useCallback(async (slug) => {
    if (!user) return null;
    try {
      const res = await apiClient.get(`/api/watch-history/${slug}`);
      return res.data;
    } catch (err) {
      return null;
    }
  }, [user]);

  return (
    <WatchHistoryContext.Provider
      value={{
        histories,
        loading,
        pagination,
        fetchWatchHistory,
        addToWatchHistory,
        removeFromWatchHistory,
        clearAllWatchHistory,
        getMovieWatchHistory,
      }}
    >
      {children}
    </WatchHistoryContext.Provider>
  );
};

export const useWatchHistory = () => useContext(WatchHistoryContext);
