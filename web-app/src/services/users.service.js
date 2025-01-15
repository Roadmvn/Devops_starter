import api from './api.config'

class UserService {
  async getUsers(params = {}) {
    try {
      const response = await api.get('/users', { params })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getUser(id) {
    try {
      const response = await api.get(`/users/${id}`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async createUser(userData) {
    try {
      const response = await api.post('/users', userData)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async deleteUser(id) {
    try {
      await api.delete(`/users/${id}`)
      return true
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async updateUserStatus(id, status) {
    try {
      const response = await api.patch(`/users/${id}/status`, { status })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async updateUserRole(id, role) {
    try {
      const response = await api.patch(`/users/${id}/role`, { role })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getUserActivity(id, params = {}) {
    try {
      const response = await api.get(`/users/${id}/activity`, { params })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async uploadAvatar(id, imageFile) {
    try {
      const formData = new FormData()
      formData.append('avatar', imageFile)

      const response = await api.post(`/users/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async searchUsers(query) {
    try {
      const response = await api.get('/users/search', {
        params: { q: query }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getUserStats() {
    try {
      const response = await api.get('/users/stats')
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async exportUsers(format = 'csv') {
    try {
      const response = await api.get(`/users/export/${format}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  _handleError(error) {
    if (error.validationErrors) {
      return {
        message: 'Erreur de validation',
        errors: error.validationErrors
      }
    }

    return {
      message: error.message || 'Une erreur est survenue',
      error
    }
  }
}

export default new UserService()
