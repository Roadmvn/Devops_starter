import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { createRouter, createWebHistory } from 'vue-router'

// Mock du router
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', name: 'Home' }]
})

describe('ErrorBoundary.vue', () => {
  // Test du rendu normal
  it('rend le contenu normal quand il n\'y a pas d\'erreur', () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Contenu normal</div>'
      }
    })
    
    expect(wrapper.text()).toContain('Contenu normal')
    expect(wrapper.find('.error-boundary').exists()).toBe(false)
  })

  // Test de la capture d'erreur
  it('capture et affiche les erreurs', async () => {
    const errorComponent = {
      template: '<div>{{ throwError() }}</div>',
      setup() {
        return {
          throwError: () => {
            throw new Error('Test error')
          }
        }
      }
    }

    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: errorComponent
      },
      global: {
        plugins: [router]
      }
    })
    
    expect(wrapper.find('.error-boundary').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test error')
  })

  // Test du bouton Réessayer
  it('réinitialise l\'erreur lors du clic sur Réessayer', async () => {
    const wrapper = mount(ErrorBoundary, {
      data() {
        return {
          error: new Error('Test error')
        }
      },
      global: {
        plugins: [router]
      }
    })
    
    const retryButton = wrapper.find('[data-test="retry-button"]')
    await retryButton.trigger('click')
    
    expect(wrapper.find('.error-boundary').exists()).toBe(false)
  })

  // Test du bouton Retour à l'accueil
  it('navigue vers l\'accueil lors du clic sur le bouton correspondant', async () => {
    const wrapper = mount(ErrorBoundary, {
      props: {
        canReset: true
      },
      data() {
        return {
          error: new Error('Test error')
        }
      },
      global: {
        plugins: [router]
      }
    })
    
    const routerPushSpy = vi.spyOn(router, 'push')
    const homeButton = wrapper.find('[data-test="home-button"]')
    await homeButton.trigger('click')
    
    expect(routerPushSpy).toHaveBeenCalledWith('/')
  })

  // Test de l'affichage des détails
  it('affiche/cache les détails de l\'erreur', async () => {
    const wrapper = mount(ErrorBoundary, {
      data() {
        return {
          error: new Error('Test error')
        }
      }
    })
    
    expect(wrapper.find('.error-details').isVisible()).toBe(false)
    
    const detailsButton = wrapper.find('[data-test="toggle-details-button"]')
    await detailsButton.trigger('click')
    
    expect(wrapper.find('.error-details').isVisible()).toBe(true)
  })

  // Test des différents types d'erreurs
  it('gère différents types d\'erreurs', () => {
    const errors = [
      new Error('Standard error'),
      new TypeError('Type error'),
      { message: 'Custom error object' }
    ]

    errors.forEach(error => {
      const wrapper = mount(ErrorBoundary, {
        data() {
          return { error }
        }
      })
      
      expect(wrapper.find('.error-boundary').exists()).toBe(true)
      expect(wrapper.text()).toContain(error.message)
    })
  })

  // Test de la prop canReset
  it('contrôle l\'affichage du bouton de réinitialisation', () => {
    const wrapper = mount(ErrorBoundary, {
      props: {
        canReset: false
      },
      data() {
        return {
          error: new Error('Test error')
        }
      }
    })
    
    expect(wrapper.find('[data-test="home-button"]').exists()).toBe(false)
  })
})
