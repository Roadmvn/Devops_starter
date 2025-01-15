<template>
  <div class="flex h-screen flex-col justify-between border-r bg-white">
    <div class="px-4 py-6">
      <!-- Logo -->
      <div class="flex items-center gap-2 mb-8">
        <img src="@/assets/logo.svg" alt="Logo" class="h-10 w-10" />
        <span class="text-xl font-bold">SuperMarket</span>
      </div>

      <!-- Navigation -->
      <nav aria-label="Main Nav" class="mt-6 flex flex-col space-y-1">
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-2 rounded-lg px-4 py-2',
            $route.path === item.path
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          ]"
        >
          <component :is="item.icon" class="h-5 w-5 opacity-75" />
          <span class="text-sm font-medium">{{ item.name }}</span>
        </router-link>
      </nav>
    </div>

    <!-- User Profile -->
    <div class="sticky inset-x-0 bottom-0 border-t border-gray-100">
      <div class="flex items-center gap-2 bg-white p-4 hover:bg-gray-50">
        <img
          :src="userAvatar"
          alt=""
          class="h-10 w-10 rounded-full object-cover"
        />

        <div>
          <p class="text-xs">
            <strong class="block font-medium">{{ userName }}</strong>
            <span>{{ userEmail }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Icônes (utilisant Heroicons)
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const authStore = useAuthStore()

// Items de navigation
const navigationItems = [
  {
    name: 'Tableau de bord',
    path: '/',
    icon: HomeIcon
  },
  {
    name: 'Produits',
    path: '/products',
    icon: ShoppingBagIcon
  },
  {
    name: 'Utilisateurs',
    path: '/users',
    icon: UsersIcon
  },
  {
    name: 'Factures',
    path: '/invoices',
    icon: DocumentTextIcon
  },
  {
    name: 'Rapports',
    path: '/reports',
    icon: ChartBarIcon
  }
]

// Informations utilisateur
const userName = computed(() => authStore.user?.name || 'Utilisateur')
const userEmail = computed(() => authStore.user?.email || '')
const userAvatar = computed(() => authStore.user?.avatar || '/default-avatar.png')
</script>
