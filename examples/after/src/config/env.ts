export const getApiUrl = (): string => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }
  return import.meta.env.VITE_API_URL || '/api';
};

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.DEV ? 'development' : 'production',
  appName: import.meta.env.VITE_APP_NAME || 'Grenoble Career Optimizer',
} as const;
