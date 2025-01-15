<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar v-if="authStore.isAuthenticated" />
    <main class="container mx-auto px-4 py-8">
      <router-view></router-view>
    </main>

    <!-- Composant de notifications -->
    <NotificationToast />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'
import NotificationToast from './components/NotificationToast.vue'

const authStore = useAuthStore()
</script>

<style scoped>
#app {
  @apply min-h-screen bg-gray-100;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
