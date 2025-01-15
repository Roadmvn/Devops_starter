// Gestion du localStorage
export const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error)
      return null
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Erreur lors de l'écriture de ${key}:`, error)
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error)
    }
  },

  clear() {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Erreur lors du nettoyage du localStorage:', error)
    }
  }
}

// Debounce
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle
export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Deep clone
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
    )
  }
}

// Génération d'ID unique
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Tri de tableau
export const sortArray = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1
    return 0
  })
}

// Filtrage de tableau
export const filterArray = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      return item[key] === value
    })
  })
}

// Groupement de tableau
export const groupBy = (array, key) => {
  return array.reduce((acc, item) => {
    const groupKey = item[key]
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(item)
    return acc
  }, {})
}

// Téléchargement de fichier
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// Copie dans le presse-papiers
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Erreur lors de la copie:', error)
    return false
  }
}

// Vérification de support des fonctionnalités du navigateur
export const browserSupport = {
  localStorage: (() => {
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      return true
    } catch (e) {
      return false
    }
  })(),

  webp: (() => {
    const elem = document.createElement('canvas')
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
  })(),

  touch: (() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })()
}

// Gestion des erreurs
export const errorHandler = (error) => {
  console.error('Error:', error)
  
  if (error.response) {
    // Erreur de l'API
    return {
      message: error.response.data.message || 'Erreur serveur',
      status: error.response.status
    }
  } else if (error.request) {
    // Pas de réponse
    return {
      message: 'Impossible de contacter le serveur',
      status: 0
    }
  } else {
    // Erreur de configuration
    return {
      message: error.message || 'Une erreur est survenue',
      status: -1
    }
  }
}

// Gestion des permissions
export const checkPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions) return false
  return userPermissions.includes(requiredPermission)
}

// Formatage des données pour les graphiques
export const formatChartData = (data, labelKey, valueKey) => {
  return {
    labels: data.map(item => item[labelKey]),
    datasets: [{
      data: data.map(item => item[valueKey])
    }]
  }
}
