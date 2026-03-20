import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../services/apiClient';

export const UserContext = createContext();

const buildUserFromToken = (token) => {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(padLength);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((ch) => `%${`00${ch.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    const payload = JSON.parse(json);

    if (!payload?.id) return null;

    return {
      _id: payload.id,
      id: payload.id,
      name: payload.name || 'User',
      email: payload.email || '',
      role: payload.role || 'user',
    };
  } catch {
    return null;
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    let token = null;
    let fallbackUser = null;
    try {
      token = await SecureStore.getItemAsync('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      fallbackUser = buildUserFromToken(token);
      const res = await apiClient.get('/api/user');
      setUser(res.data.user || null);
    } catch (err) {
      console.error('Fetch user error:', err);

      if (err.response?.status === 401) {
        await SecureStore.deleteItemAsync('token');
        setUser(null);
      } else if (fallbackUser) {
        // Keep authenticated UX stable when simulator network fails but token is still valid.
        setUser((prev) => prev || fallbackUser);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      await SecureStore.deleteItemAsync('token');
      setUser(null);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, fetchUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
