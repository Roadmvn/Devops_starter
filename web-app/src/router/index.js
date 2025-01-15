import { createRouter, createWebHistory } from 'vue-router'
import AuthService from '../services/auth.service'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['manager', 'admin'] }
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('../views/ProductsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoices',
    name: 'invoices',
    component: () => import('../views/InvoicesView.vue'),
    meta: { requiresAuth: true }
  },
  // Redirection par défaut vers login
  {
    path: '/',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const currentUser = AuthService.getCurrentUser()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isGuestRoute = to.matched.some(record => record.meta.guest)

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (requiresAuth && !currentUser) {
    next('/login')
    return
  }

  // Si l'utilisateur est connecté et essaie d'accéder à une route invité (comme login)
  if (isGuestRoute && currentUser) {
    next('/products')
    return
  }

  // Si l'utilisateur est sur la route racine
  if (to.path === '/') {
    if (currentUser) {
      next('/products')
    } else {
      next('/login')
    }
    return
  }

  next()
})

export default router
