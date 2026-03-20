import axios from 'axios';
import { API_MOVIES } from '../constants/config';

// Search movies from phimapi.com
export const searchMovies = async ({ keyword, page = 1, limit = 24 }) => {
  try {
    const res = await axios.get(`${API_MOVIES}/v1/api/tim-kiem`, {
      params: { keyword, page, limit },
    });
    return res.data;
  } catch (error) {
    console.error('Search movies error:', error);
    throw error;
  }
};

// Get movie detail by slug
export const getMovieDetail = async (slug) => {
  try {
    const res = await axios.get(`${API_MOVIES}/phim/${slug}`);
    return res.data;
  } catch (error) {
    console.error('Get movie detail error:', error);
    throw error;
  }
};

// Get movies by category
export const getMoviesByCategory = async (categorySlug, page = 1, limit = 24) => {
  try {
    const res = await axios.get(`${API_MOVIES}/v1/api/the-loai/${categorySlug}`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error('Get movies by category error:', error);
    throw error;
  }
};

// Get movies by country
export const getMoviesByCountry = async (countrySlug, page = 1, limit = 24) => {
  try {
    const res = await axios.get(`${API_MOVIES}/v1/api/quoc-gia/${countrySlug}`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error('Get movies by country error:', error);
    throw error;
  }
};

// Get movies by list type (phim-le, phim-bo, hoat-hinh, tv-shows)
export const getMoviesByType = async (type, page = 1, limit = 24) => {
  try {
    if (type === 'phim-moi-cap-nhat') {
      const res = await axios.get(`${API_MOVIES}/danh-sach/phim-moi-cap-nhat`, {
        params: { page },
      });

      const payload = res.data || {};
      const items = payload.items || [];
      const pagination = payload.pagination || {};

      // Keep the same shape as /v1/api/danh-sach/* for compatibility across screens.
      return {
        status: 'success',
        data: {
          items,
          params: {
            pagination: {
              currentPage: page,
              totalPages: pagination.totalPages || 1,
              totalItems: pagination.totalItems || items.length,
            },
          },
          titlePage: payload.titlePage || 'Phim Mới Cập Nhật',
        },
      };
    }

    const res = await axios.get(`${API_MOVIES}/v1/api/danh-sach/${type}`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error('Get movies by type error:', error);
    throw error;
  }
};

// Get all genres/categories
export const getAllGenres = async () => {
  try {
    const res = await axios.get(`${API_MOVIES}/the-loai`);
    return res.data;
  } catch (error) {
    console.error('Get genres error:', error);
    throw error;
  }
};

// Get new updated movies (for home page)
export const getNewMovies = async (page = 1) => {
  try {
    const res = await axios.get(`${API_MOVIES}/danh-sach/phim-moi-cap-nhat`, {
      params: { page },
    });
    return res.data;
  } catch (error) {
    console.error('Get new movies error:', error);
    throw error;
  }
};
