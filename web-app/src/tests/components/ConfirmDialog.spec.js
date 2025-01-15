import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

describe('ConfirmDialog.vue', () => {
  // Test du rendu initial
  it('rend correctement le composant', () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        show: true,
        title: 'Confirmation',
        message: 'Êtes-vous sûr ?'
      }
    })
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Confirmation')
    expect(wrapper.text()).toContain('Êtes-vous sûr ?')
  })

  // Test des boutons
  it('émet les bons événements lors des clics', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        show: true
      }
    })
    
    // Test du bouton Confirmer
    const confirmButton = wrapper.find('[data-test="confirm-button"]')
    await confirmButton.trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
    
    // Test du bouton Annuler
    const cancelButton = wrapper.find('[data-test="cancel-button"]')
    await cancelButton.trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  // Test des différents types
  it('applique le bon style selon le type', () => {
    const types = ['info', 'warning', 'danger']
    
    types.forEach(type => {
      const wrapper = mount(ConfirmDialog, {
        props: {
          show: true,
          type
        }
      })
      
      expect(wrapper.find('[data-test="dialog-icon"]').classes()).toContain(`icon-${type}`)
    })
  })

  // Test de la fermeture par overlay
  it('se ferme lors du clic sur l\'overlay', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        show: true,
        closeOnOverlayClick: true
      }
    })
    
    const overlay = wrapper.find('[data-test="dialog-overlay"]')
    await overlay.trigger('click')
    expect(wrapper.emitted('update:show')).toBeTruthy()
    expect(wrapper.emitted('update:show')[0]).toEqual([false])
  })

  // Test des touches de clavier
  it('réagit aux touches du clavier', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        show: true
      }
    })
    
    // Test de la touche Entrée
    await wrapper.trigger('keydown.enter')
    expect(wrapper.emitted('confirm')).toBeTruthy()
    
    // Test de la touche Échap
    await wrapper.trigger('keydown.esc')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  // Test du contenu personnalisé
  it('accepte du contenu personnalisé via les slots', () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        show: true
      },
      slots: {
        title: '<h2>Titre personnalisé</h2>',
        content: '<p>Contenu personnalisé</p>',
        actions: '<button>Action personnalisée</button>'
      }
    })
    
    expect(wrapper.html()).toContain('Titre personnalisé')
    expect(wrapper.html()).toContain('Contenu personnalisé')
    expect(wrapper.html()).toContain('Action personnalisée')
  })

  // Test de l'animation
  it('a les bonnes classes d\'animation', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        show: true
      }
    })
    
    expect(wrapper.classes()).toContain('dialog-enter-active')
    
    await wrapper.setProps({ show: false })
    expect(wrapper.classes()).toContain('dialog-leave-active')
  })
})
