// Validation d'email
export const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  return re.test(String(email).toLowerCase())
}

// Validation de mot de passe
export const isValidPassword = (password) => {
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/
  return re.test(password)
}

// Validation de numéro de téléphone français
export const isValidPhone = (phone) => {
  const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  return re.test(phone)
}

// Validation de code postal français
export const isValidPostalCode = (code) => {
  const re = /^[0-9]{5}$/
  return re.test(code)
}

// Validation de SIRET
export const isValidSiret = (siret) => {
  const re = /^[0-9]{14}$/
  return re.test(siret)
}

// Validation de montant
export const isValidAmount = (amount) => {
  return !isNaN(amount) && amount >= 0
}

// Validation de date
export const isValidDate = (date) => {
  const d = new Date(date)
  return d instanceof Date && !isNaN(d)
}

// Validation de fichier
export const isValidFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB par défaut
    allowedTypes = []
  } = options

  if (file.size > maxSize) {
    return false
  }

  if (allowedTypes.length && !allowedTypes.includes(file.type)) {
    return false
  }

  return true
}

// Validation d'URL
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Validation de champ requis
export const isRequired = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0
  }
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length > 0
  }
  return value !== undefined && value !== null && value !== ''
}

// Validation de longueur minimale
export const minLength = (value, min) => {
  return String(value).length >= min
}

// Validation de longueur maximale
export const maxLength = (value, max) => {
  return String(value).length <= max
}

// Validation de plage numérique
export const isInRange = (value, min, max) => {
  const num = Number(value)
  return !isNaN(num) && num >= min && num <= max
}

// Validation personnalisée pour les formulaires
export const validateForm = (data, rules) => {
  const errors = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const { validator, message } = rule
      const isValid = validator(data[field])

      if (!isValid) {
        errors[field] = message
        break
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
