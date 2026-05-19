// Central API service for VoiceFlow AI
// All backend calls go through this file

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Token Helpers ────────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem('voiceflow_token');
export const setToken = (token) => localStorage.setItem('voiceflow_token', token);
export const removeToken = () => localStorage.removeItem('voiceflow_token');

export const getUser = () => {
  const raw = localStorage.getItem('voiceflow_user');
  return raw ? JSON.parse(raw) : null;
};
export const setUser = (user) => localStorage.setItem('voiceflow_user', JSON.stringify(user));
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
};

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
  getStats: () => request('/api/user/stats'),
};
