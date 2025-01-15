import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../stores/auth'

// Configuration des routes pour les tests
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/',
    name: 'home',
    component: { template: '<div>Home</div>' }
  }
]

describe('LoginView', () => {
  let router
  let pinia
  
  beforeEach(() => {
    // Créer une nouvelle instance de Pinia pour chaque test
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Créer une nouvelle instance du router pour chaque test
    router = createRouter({
      history: createWebHistory(),
      routes
    })

    // Démarrer le router
    router.push('/login')
    // S'assurer que la navigation est terminée
    return router.isReady()
  })

  it('renders login form correctly', async () => {
    const { getByText, getByLabelText } = render(LoginView, {
      global: {
        plugins: [router, pinia]
      }
    })

    expect(getByText('Connexion au tableau de bord')).toBeTruthy()
    expect(getByLabelText('Email')).toBeTruthy()
    expect(getByLabelText('Mot de passe')).toBeTruthy()
    expect(getByText('Se connecter')).toBeTruthy()
  })

  it('handles login submission', async () => {
    const store = useAuthStore()
    
    // Mock de la méthode login du store
    const loginSpy = vi.spyOn(store, 'login')
    loginSpy.mockImplementation(async () => true)

    const { getByLabelText, getByRole } = render(LoginView, {
      global: {
        plugins: [router, pinia]
      }
    })

    // Simuler la saisie des informations de connexion
    await fireEvent.update(getByLabelText('Email'), 'test@example.com')
    await fireEvent.update(getByLabelText('Mot de passe'), 'password123')
    
    // Récupérer le bouton de soumission et cliquer dessus
    const submitButton = getByRole('button', { name: /se connecter/i })
    await fireEvent.click(submitButton)

    // Attendre que les actions asynchrones soient terminées
    await vi.waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password123'
      })
    })

    // Vérifier que la redirection a eu lieu
    await vi.waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/')
    })
  })
})
