const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/Zen/gobite/api';
const AUTH_USER = 'admin';
const AUTH_PASS = 'secret123';

/**
 * Centrialized API client for GoBite
 */
export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;

    // Setup Basic Auth header
    const auth = btoa(`${AUTH_USER}:${AUTH_PASS}`);

    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

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
