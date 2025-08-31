export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002',
  ENDPOINTS: {
    RATE_USER: '/rate-user',
    LEADERBOARD: '/leaderboard',
  }
} as const;

export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const API_URLS = {
  RATE_USER: buildApiUrl(API_CONFIG.ENDPOINTS.RATE_USER),
  LEADERBOARD: buildApiUrl(API_CONFIG.ENDPOINTS.LEADERBOARD),
} as const; 