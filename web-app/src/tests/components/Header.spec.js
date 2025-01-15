import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Header from '@/components/Header.vue'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth'

describe('Header.vue', () => {
  // Test du rendu initial
  it('rend correctement le composant', () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createTestingPinia()]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test de la barre de recherche
  it('émet un événement search lors de la saisie', async () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createTestingPinia()]
      }
    })
    
    const searchInput = wrapper.find('input[type="search"]')
    await searchInput.setValue('test')
    
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0]).toEqual(['test'])
  })

  // Test du menu utilisateur
  it('affiche le menu utilisateur quand connecté', async () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            auth: {
              user: { name: 'John Doe' },
              isAuthenticated: true
            }
          }
        })]
      }
    })
    
    const userMenu = wrapper.find('[data-test="user-menu"]')
    expect(userMenu.exists()).toBe(true)
    expect(userMenu.text()).toContain('John Doe')
  })

  // Test de la déconnexion
  it('appelle logout lors du clic sur déconnexion', async () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            auth: {
              isAuthenticated: true
            }
          }
        })]
      }
    })

    const authStore = useAuthStore()
    const logoutSpy = vi.spyOn(authStore, 'logout')
    
    const logoutButton = wrapper.find('[data-test="logout-button"]')
    await logoutButton.trigger('click')
    
    expect(logoutSpy).toHaveBeenCalled()
  })

  // Test du mode responsive
  it('affiche/cache le menu mobile correctement', async () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [createTestingPinia()]
      }
    })
    
    const menuButton = wrapper.find('[data-test="mobile-menu-button"]')
    expect(wrapper.find('[data-test="mobile-menu"]').isVisible()).toBe(false)
    
    await menuButton.trigger('click')
    expect(wrapper.find('[data-test="mobile-menu"]').isVisible()).toBe(true)
  })
})
