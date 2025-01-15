<!-- NavBar.vue -->
<template>
  <nav class="bg-gray-800 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <div class="flex items-center">
        <router-link to="/" class="text-white text-xl font-bold">SuperMarché</router-link>
      </div>
      
      <div class="flex space-x-6">
        <router-link 
          v-for="item in navItems" 
          :key="item.path" 
          :to="item.path"
          class="text-gray-300 hover:text-white transition-colors duration-200"
          :class="{ 'text-white': isCurrentRoute(item.path) }"
        >
          {{ item.name }}
        </router-link>
      </div>

      <div class="flex items-center space-x-4">
        <span class="text-gray-300">{{ userName }}</span>
        <button 
          @click="handleLogout" 
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Déconnexion
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const navItems = [
  { name: 'Produits', path: '/products' },
  { name: 'Commandes', path: '/orders' },
  { name: 'Factures', path: '/invoices' },
  { name: 'Statistiques', path: '/stats' }
]

const userName = computed(() => {
  const user = authStore.user
  return user?.firstName ? `${user.firstName} ${user.lastName}` : 'Utilisateur'
})

const isCurrentRoute = (path) => {
  return route.path === path
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.router-link-active {
  @apply text-white font-medium;
}
</style>
