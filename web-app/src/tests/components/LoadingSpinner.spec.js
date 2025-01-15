import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

describe('LoadingSpinner.vue', () => {
  // Test du rendu par défaut
  it('rend correctement le composant', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('loading-spinner')
  })

  // Test des différentes tailles
  it('applique la bonne classe selon la taille', () => {
    const sizes = ['sm', 'md', 'lg']
    
    sizes.forEach(size => {
      const wrapper = mount(LoadingSpinner, {
        props: { size }
      })
      expect(wrapper.classes()).toContain(`spinner-${size}`)
    })
  })

  // Test des différentes couleurs
  it('applique la bonne couleur', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { color: '#ff0000' }
    })
    
    const spinner = wrapper.find('.spinner-element')
    expect(spinner.attributes('style')).toContain('border-top-color: #ff0000')
  })

  // Test de l'overlay
  it('affiche un overlay quand demandé', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { overlay: true }
    })
    
    expect(wrapper.classes()).toContain('spinner-overlay')
  })

  // Test du texte de chargement
  it('affiche le texte de chargement', () => {
    const loadingText = 'Chargement en cours...'
    const wrapper = mount(LoadingSpinner, {
      props: { text: loadingText }
    })
    
    expect(wrapper.text()).toContain(loadingText)
  })

  // Test de l'animation
  it('a la bonne animation CSS', () => {
    const wrapper = mount(LoadingSpinner)
    const spinner = wrapper.find('.spinner-element')
    
    const style = window.getComputedStyle(spinner.element)
    expect(style.animation).toContain('spin')
  })

  // Test de la visibilité
  it('peut être masqué', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { visible: false }
    })
    
    expect(wrapper.isVisible()).toBe(false)
  })
})
