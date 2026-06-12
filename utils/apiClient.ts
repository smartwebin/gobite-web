const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/Zen/gobite/api';
const AUTH_USER = 'admin';
const AUTH_PASS = 'secret123';

let _authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  _authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('gobite_jwt_token', token);
    } else {
      localStorage.removeItem('gobite_jwt_token');
    }
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined' && !_authToken) {
    _authToken = localStorage.getItem('gobite_jwt_token');
  }
  return _authToken;
};

/**
 * Centralized API client for GoBite
 */
export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;

    const token = getAuthToken();
    let authHeader = '';

    if (token) {
      authHeader = `Bearer ${token}`;
    } else {
      // Fallback to Basic Auth
      const auth = btoa(`${AUTH_USER}:${AUTH_PASS}`);
      authHeader = `Basic ${auth}`;
    }

    const headers = {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        cache: 'no-store',
      });

      if (response.status === 401) {
        // Clear token if unauthorized (expired/invalid)
        setAuthToken(null);
        if (typeof window !== 'undefined') {
          // Dispatch a custom event to tell the app to log out / reload if needed
          window.dispatchEvent(new Event('unauthorized'));
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(`API Request Warning [${endpoint}]:`, error);
      throw error;
    }
  },

  get(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint: string, body: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};
