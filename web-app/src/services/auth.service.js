import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users/';

class AuthService {
  async login(email, password) {
    try {
      const response = await axios.post(API_URL + 'login', {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error('Token non reçu du serveur');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Identifiants invalides');
      }
      throw new Error('Erreur de connexion au serveur');
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

export default new AuthService();
