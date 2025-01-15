import api from './api.config'

class InvoiceService {
  async getInvoices(params = {}) {
    try {
      const response = await api.get('/invoices', { params })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getInvoice(id) {
    try {
      const response = await api.get(`/invoices/${id}`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async createInvoice(invoiceData) {
    try {
      const response = await api.post('/invoices', invoiceData)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async updateInvoice(id, invoiceData) {
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async deleteInvoice(id) {
    try {
      await api.delete(`/invoices/${id}`)
      return true
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async markAsPaid(id) {
    try {
      const response = await api.patch(`/invoices/${id}/pay`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async markAsCancelled(id) {
    try {
      const response = await api.patch(`/invoices/${id}/cancel`)
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async generatePDF(id) {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async sendInvoiceByEmail(id, email) {
    try {
      const response = await api.post(`/invoices/${id}/send`, { email })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getInvoiceStats(params = {}) {
    try {
      const response = await api.get('/invoices/stats', { params })
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async getDueInvoices() {
    try {
      const response = await api.get('/invoices/due')
      return response.data
    } catch (error) {
      throw this._handleError(error)
    }
  }

  async searchInvoices(query) {
    try {
      const response = await api.get('/invoices/search', {
        params: { q: query }
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

export default new InvoiceService()
