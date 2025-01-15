<template>
  <div>
    <div v-if="error" class="error-boundary">
      <div class="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div class="flex items-center mb-4">
          <ExclamationTriangleIcon class="h-8 w-8 text-red-500 mr-3" />
          <h2 class="text-xl font-semibold text-gray-900">
            Une erreur est survenue
          </h2>
        </div>

        <div class="bg-red-50 p-4 rounded-md mb-4">
          <p class="text-sm text-red-700">
            {{ error.message }}
          </p>
        </div>

        <div v-if="showDetails" class="mb-4">
          <div class="bg-gray-100 p-4 rounded-md">
            <pre class="text-xs text-gray-700 overflow-auto">{{ error.stack }}</pre>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <button
            @click="toggleDetails"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            {{ showDetails ? 'Masquer les détails' : 'Afficher les détails' }}
          </button>

          <div class="space-x-2">
            <button
              @click="handleRetry"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon class="h-4 w-4 mr-1.5" />
              Réessayer
            </button>
            <button
              v-if="canReset"
              @click="handleReset"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <HomeIcon class="h-4 w-4 mr-1.5" />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  canReset: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const error = ref(null)
const showDetails = ref(false)

// Capture les erreurs des composants enfants
onErrorCaptured((err, component, info) => {
  console.error('Erreur capturée par ErrorBoundary:', err)
  error.value = err
  // Empêche la propagation de l'erreur
  return false
})

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const handleRetry = () => {
  error.value = null
  // Recharge la page actuelle
  router.go(0)
}

const handleReset = () => {
  error.value = null
  // Retour à la page d'accueil
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f3f4f6;
}
</style>
