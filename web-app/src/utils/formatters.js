// Formatage des dates
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  }
  return new Date(date).toLocaleDateString('fr-FR', defaultOptions)
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatage des montants
export const formatPrice = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency
  }).format(amount)
}

// Formatage des nombres
export const formatNumber = (number, options = {}) => {
  return new Intl.NumberFormat('fr-FR', options).format(number)
}

// Formatage des pourcentages
export const formatPercent = (number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(number / 100)
}

// Formatage des téléphones
export const formatPhone = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)
  if (match) {
    return match.slice(1).join(' ')
  }
  return phone
}

// Formatage des tailles de fichiers
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Formatage du temps écoulé
export const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  const intervals = {
    année: 31536000,
    mois: 2592000,
    semaine: 604800,
    jour: 86400,
    heure: 3600,
    minute: 60,
    seconde: 1
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `Il y a ${interval} ${unit}${interval > 1 ? 's' : ''}`
    }
  }
  return "À l'instant"
}

// Formatage des statuts
export const formatStatus = (status) => {
  const statusMap = {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
    completed: 'Terminé',
    cancelled: 'Annulé'
  }
  return statusMap[status] || status
}

// Formatage des noms
export const formatName = (firstName, lastName) => {
  return [firstName, lastName].filter(Boolean).join(' ')
}

// Formatage des adresses email
export const formatEmail = (email, maxLength = 20) => {
  if (!email || email.length <= maxLength) return email
  const [local, domain] = email.split('@')
  if (local.length <= maxLength - 3) return email
  return `${local.slice(0, maxLength - 3)}...@${domain}`
}
