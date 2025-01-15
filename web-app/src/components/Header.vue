<template>
  <header class="bg-white shadow">
    <div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Bouton menu mobile -->
      <button
        @click="$emit('toggle-sidebar')"
        type="button"
        class="text-gray-500 lg:hidden"
      >
        <span class="sr-only">Open menu</span>
        <Bars3Icon class="h-6 w-6" />
      </button>

      <!-- Barre de recherche -->
      <div class="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
        <div class="w-full max-w-lg lg:max-w-xs">
          <label for="search" class="sr-only">Rechercher</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="search"
              v-model="searchQuery"
              class="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Rechercher..."
              type="search"
              @input="handleSearch"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        <button
          type="button"
          class="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="toggleNotifications"
        >
          <span class="sr-only">Voir les notifications</span>
          <BellIcon class="h-6 w-6" />
          <span
            v-if="unreadNotifications > 0"
            class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
          >
            {{ unreadNotifications }}
          </span>
        </button>

        <!-- Menu utilisateur -->
        <div class="relative">
          <button
            type="button"
            class="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @click="toggleUserMenu"
          >
            <span class="sr-only">Ouvrir le menu utilisateur</span>
            <img
              :src="userAvatar"
              alt=""
              class="h-8 w-8 rounded-full"
            />
          </button>

          <!-- Menu déroulant -->
          <div
            v-if="showUserMenu"
            class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <router-link
              to="/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Mon profil
            </router-link>
            <router-link
              to="/settings"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Paramètres
            </router-link>
            <button
              @click="handleLogout"
              class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// État local
const searchQuery = ref('')
const showUserMenu = ref(false)
const showNotifications = ref(false)

// Computed properties
const userAvatar = computed(() => authStore.user?.avatar || '/default-avatar.png')
const unreadNotifications = computed(() => notificationStore.unreadCount)

// Méthodes
const handleSearch = () => {
  // Implémenter la logique de recherche
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}

// Fermer les menus lors du clic à l'extérieur
const closeMenus = (event) => {
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false
    showNotifications.value = false
  }
}

// Ajouter/supprimer l'écouteur d'événements
onMounted(() => {
  document.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
})
</script>
