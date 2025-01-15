import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Sidebar from '@/components/Sidebar.vue'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'

// Création d'un router mock
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/products', name: 'Products' },
    { path: '/users', name: 'Users' },
    { path: '/invoices', name: 'Invoices' }
  ]
})

describe('Sidebar.vue', () => {
  // Test du rendu initial
  it('rend correctement le composant', () => {
    const wrapper = mount(Sidebar, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test des liens de navigation
  it('affiche tous les liens de navigation', () => {
    const wrapper = mount(Sidebar, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    })
    
    const navLinks = wrapper.findAll('[data-test="nav-link"]')
    expect(navLinks).toHaveLength(4) // Dashboard, Products, Users, Invoices
  })

  // Test des permissions
  it('cache les liens non autorisés selon les permissions', () => {
    const wrapper = mount(Sidebar, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            auth: {
              user: {
                permissions: ['view_dashboard', 'view_products']
              }
            }
          }
        }), router]
      }
    })
    
    const visibleLinks = wrapper.findAll('[data-test="nav-link"]:not(.hidden)')
    expect(visibleLinks).toHaveLength(2)
  })

  // Test de l'état actif
  it('met en surbrillance le lien actif', async () => {
    const wrapper = mount(Sidebar, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    })
    
    await router.push('/dashboard')
    expect(wrapper.find('[data-test="nav-link-dashboard"]').classes()).toContain('active')
  })

  // Test du toggle du sidebar
  it('peut être réduit/étendu', async () => {
    const wrapper = mount(Sidebar, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    })
    
    const toggleButton = wrapper.find('[data-test="sidebar-toggle"]')
    expect(wrapper.classes()).not.toContain('collapsed')
    
    await toggleButton.trigger('click')
    expect(wrapper.classes()).toContain('collapsed')
  })

  // Test de la persistance de l'état
  it('conserve l\'état collapsed dans le localStorage', async () => {
    const wrapper = mount(Sidebar, {
      global: {
        plugins: [createTestingPinia(), router]
      }
    })
    
    const toggleButton = wrapper.find('[data-test="sidebar-toggle"]')
    await toggleButton.trigger('click')
    
    expect(localStorage.getItem('sidebar_collapsed')).toBe('true')
  })
})
