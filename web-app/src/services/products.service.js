import api from './api.config'

class ProductService {
  async getProducts(params = {}) {
    try {
      const response = await api.get('/products', { params })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getProduct(id) {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async deleteProduct(id) {
    try {
      await api.delete(`/products/${id}`)
      return true
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async updateStock(id, quantity) {
    try {
      const response = await api.patch(`/products/${id}/stock`, { quantity })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getCategories() {
    try {
      const response = await api.get('/products/categories')
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async searchProducts(query) {
    try {
      const response = await api.get('/products/search', {
        params: { q: query }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async uploadProductImage(id, imageFile) {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const response = await api.post(`/products/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getProductStats() {
    try {
      const response = await api.get('/products/stats')
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

export default new ProductService()
