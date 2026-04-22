import api from './api';

export const authService = {
  async login(credentials) {
    return api.post('/auth/login', credentials);
  },

  async register(userData) {
    return api.post('/auth/register', userData);
  },

  async logout() {
    return api.post('/auth/logout');
  },

  async getCurrentUser() {
    // Since we don't have a current user endpoint, we'll use the user profile
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // We'll parse the token to get user info (simplified approach)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  },

  verifyToken() {
    const token = localStorage.getItem('token');
    return !!token;
  }
};