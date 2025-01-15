<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
      <div>
        <label for="firstName" class="block text-sm font-medium text-gray-700">Prénom</label>
        <input
          type="text"
          id="firstName"
          v-model="formData.firstName"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label for="lastName" class="block text-sm font-medium text-gray-700">Nom</label>
        <input
          type="text"
          id="lastName"
          v-model="formData.lastName"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
      <input
        type="email"
        id="email"
        v-model="formData.email"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="role" class="block text-sm font-medium text-gray-700">Rôle</label>
      <select
        id="role"
        v-model="formData.role"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="user">Utilisateur</option>
        <option value="admin">Administrateur</option>
        <option value="manager">Manager</option>
      </select>
    </div>

    <div v-if="!user">
      <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
      <input
        type="password"
        id="password"
        v-model="formData.password"
        :required="!user"
        minlength="6"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div class="flex items-center">
      <input
        id="isActive"
        type="checkbox"
        v-model="formData.isActive"
        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label for="isActive" class="ml-2 block text-sm text-gray-900">
        Compte actif
      </label>
    </div>

    <div class="flex justify-end space-x-3">
      <button
        type="button"
        @click="$emit('cancel')"
        class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Annuler
      </button>
      <button
        type="submit"
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {{ user ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: 'user',
  password: '',
  isActive: true
})

onMounted(() => {
  if (props.user) {
    formData.value = {
      ...props.user,
      password: '' // Ne pas inclure le mot de passe lors de la modification
    }
  }
})

const handleSubmit = () => {
  const submitData = { ...formData.value }
  if (props.user && !submitData.password) {
    delete submitData.password
  }
  emit('submit', submitData)
}
</script>
