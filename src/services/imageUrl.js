const IMAGE_CDN_BASE = 'https://phimimg.com';

export const getMovieImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  const normalized = rawUrl.trim();
  if (!normalized) return '';

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  return `${IMAGE_CDN_BASE}/${normalized.replace(/^\/+/, '')}`;
};
