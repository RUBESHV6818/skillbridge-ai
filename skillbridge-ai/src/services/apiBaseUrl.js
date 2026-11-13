const configuredApiUrl = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error('VITE_API_URL must be set to the deployed SkillBridge API before building for production.');
}

const localApiUrl = 'http://localhost:5001';
export const API_ORIGIN = (configuredApiUrl || localApiUrl).replace(/\/api$/i, '');
export const API_BASE_URL = `${API_ORIGIN}/api`;
