// Rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
}

// Permissions
export const PERMISSIONS = {
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  VIEW_STATS: 'view_stats',
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_INVOICES: 'manage_invoices'
}

// Statuts
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  CANCELLED: 'cancelled'
}

// Types de notification
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Configuration des tableaux
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  }
}

// Types de fichiers acceptés
export const ACCEPTED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
}

// Limites
export const LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_UPLOAD_FILES: 10,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PASSWORD_LENGTH: 8
}

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  USERS: '/users',
  INVOICES: '/invoices',
  SETTINGS: '/settings',
  PROFILE: '/profile'
}

// Thèmes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
}

// États des formulaires
export const FORM_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

// Messages d'erreur
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Ce champ est requis',
  INVALID_EMAIL: 'Adresse email invalide',
  INVALID_PASSWORD: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
  INVALID_PHONE: 'Numéro de téléphone invalide',
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action',
  SESSION_EXPIRED: 'Votre session a expiré'
}

// Configuration des graphiques
export const CHART_CONFIG = {
  COLORS: [
    '#4F46E5', // Indigo
    '#06B6D4', // Cyan
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899'  // Pink
  ],
  DEFAULT_OPTIONS: {
    responsive: true,
    maintainAspectRatio: false
  }
}

// Formats de date
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'D MMMM YYYY',
  WITH_TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD'
}

// Configuration des animations
export const ANIMATION_CONFIG = {
  DURATION: 300,
  EASING: 'ease-in-out'
}
