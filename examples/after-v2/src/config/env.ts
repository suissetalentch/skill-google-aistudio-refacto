export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  environment: import.meta.env.DEV ? 'development' : 'production',
} as const;
