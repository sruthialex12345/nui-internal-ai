import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_OIDC_AUTHORITY: z.string().url(),
  VITE_OIDC_CLIENT_ID: z.string().min(1),
  VITE_OIDC_REDIRECT_URI: z.string().url(),
});

function validateEnv() {
  const env = {
    VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    VITE_OIDC_AUTHORITY: import.meta.env.VITE_OIDC_AUTHORITY || 'https://auth.example.com',
    VITE_OIDC_CLIENT_ID: import.meta.env.VITE_OIDC_CLIENT_ID || 'admin-app',
    VITE_OIDC_REDIRECT_URI: import.meta.env.VITE_OIDC_REDIRECT_URI || 'http://localhost:5173/auth/callback',
  };

  try {
    return envSchema.parse(env);
  } catch (error) {
    console.error('Invalid environment variables:', error);
    throw new Error('Invalid environment configuration');
  }
}

export const env = validateEnv();