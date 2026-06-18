// Central API service for VoiceFlow AI
// All backend calls go through this file

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ─── Token Helpers ────────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem('voiceflow_token');
export const setToken = (token) => localStorage.setItem('voiceflow_token', token);
export const removeToken = () => localStorage.removeItem('voiceflow_token');

export const getUser = () => {
  const raw = localStorage.getItem('voiceflow_user');
  return raw ? JSON.parse(raw) : null;
};
export const setUser = (user) => {
  localStorage.setItem('voiceflow_user', JSON.stringify(user));
  window.dispatchEvent(new Event('user_updated'));
};
export const removeUser = () => localStorage.removeItem('voiceflow_user');

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'An error occurred.' }));
    throw new Error(err.detail || 'An error occurred.');
  }

  // Some delete endpoints return no body
  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (name, email, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request('/api/auth/me'),

  forgotPassword: (email) =>
    request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email, code, new_password) =>
    request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password }),
    }),
};

// ─── TTS API ─────────────────────────────────────────────────────────────────

export const ttsApi = {
  generate: (text, language, voice, speed, pitch, title) =>
    request('/api/tts/generate', {
      method: 'POST',
      body: JSON.stringify({ text, language, voice, speed, pitch, title }),
    }),

  // Returns a full URL for streaming audio
  getAudioUrl: (filename) => `${BASE_URL}/api/tts/audio/${filename}`,
};

// ─── History API ──────────────────────────────────────────────────────────────

export const historyApi = {
  getAll: (search = '') =>
    request(`/api/history/?search=${encodeURIComponent(search)}`),

  delete: (id) =>
    request(`/api/history/${id}`, { method: 'DELETE' }),

  bulkDelete: (ids) =>
    request('/api/history/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
};

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
  getStats: () => request('/api/user/stats'),
  updateProfile: (name) =>
    request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),
  updatePassword: (current_password, new_password) =>
    request('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, new_password }),
    }),
  deleteAccount: () =>
    request('/api/user/me', {
      method: 'DELETE',
    }),
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  getStats: () => request('/api/admin/stats'),
  getUsers: () => request('/api/admin/users'),
  toggleAdmin: (userId) =>
    request(`/api/admin/users/${userId}/toggle-admin`, {
      method: 'PUT',
    }),
  deleteUser: (userId) =>
    request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    }),
  adjustUsage: (userId, characters_used, voices_generated) =>
    request(`/api/admin/users/${userId}/adjust-usage`, {
      method: 'PUT',
      body: JSON.stringify({ characters_used, voices_generated }),
    }),
  getGenerations: (search = '', skip = 0, limit = 50) =>
    request(`/api/admin/generations?search=${encodeURIComponent(search)}&skip=${skip}&limit=${limit}`),
  deleteGeneration: (generationId) =>
    request(`/api/admin/generations/${generationId}`, {
      method: 'DELETE',
    }),
};
