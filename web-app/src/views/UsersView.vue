<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-900">Gestion des utilisateurs</h1>
        <button
          @click="showAddModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Ajouter un utilisateur
        </button>
      </div>

      <!-- Filtres -->
      <div class="mt-4 flex space-x-4">
        <div class="flex-1">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un utilisateur..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div class="w-48">
          <select
            v-model="roleFilter"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="manager">Manager</option>
            <option value="user">Utilisateur</option>
          </select>
        </div>
        <div class="w-48">
          <select
            v-model="statusFilter"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
        </div>
      </div>

      <!-- Table des utilisateurs -->
      <div class="mt-6">
        <UserTable
          :users="filteredUsers"
          @edit="handleEdit"
          @delete="handleDelete"
          @view-history="handleViewHistory"
        />
      </div>
    </div>

    <!-- Modal d'ajout/modification -->
    <div v-if="showAddModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              {{ selectedUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur' }}
            </h3>
            <UserForm
              :user="selectedUser"
              @submit="handleSubmit"
              @cancel="closeModal"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal historique des achats -->
    <div v-if="showHistoryModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Historique des achats - {{ selectedUser?.firstName }} {{ selectedUser?.lastName }}
              </h3>
              <button
                @click="closeHistoryModal"
                class="text-gray-400 hover:text-gray-500"
              >
                <span class="sr-only">Fermer</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="mt-4">
              <!-- Table des achats -->
              <div class="flex flex-col">
                <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Produit
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantité
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prix total
                            </th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="purchase in userPurchases" :key="purchase.id">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {{ formatDate(purchase.date) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="text-sm font-medium text-gray-900">
                                {{ purchase.product.name }}
                              </div>
                              <div class="text-sm text-gray-500">
                                {{ purchase.product.brand }}
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {{ purchase.quantity }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {{ formatPrice(purchase.totalPrice) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UserTable from '../components/UserTable.vue'
import UserForm from '../components/UserForm.vue'
import { usersAPI } from '../services/api'

const users = ref([])
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const showAddModal = ref(false)
const showHistoryModal = ref(false)
const selectedUser = ref(null)
const userPurchases = ref([])

// Filtrage des utilisateurs
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesRole = !roleFilter.value || user.role === roleFilter.value
    const matchesStatus = statusFilter.value === '' || user.isActive.toString() === statusFilter.value
    
    return matchesSearch && matchesRole && matchesStatus
  })
})

// Chargement initial des utilisateurs
const loadUsers = async () => {
  try {
    const response = await usersAPI.getAll()
    users.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
  }
}

// Gestion des actions
const handleEdit = (user) => {
  selectedUser.value = user
  showAddModal.value = true
}

const handleDelete = async (user) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
    try {
      await usersAPI.delete(user.id)
      users.value = users.value.filter(u => u.id !== user.id)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const handleViewHistory = async (user) => {
  selectedUser.value = user
  showHistoryModal.value = true
  try {
    // Simuler le chargement de l'historique des achats
    // À remplacer par un vrai appel API
    userPurchases.value = [
      {
        id: 1,
        date: new Date(),
        product: { name: 'Produit 1', brand: 'Marque 1' },
        quantity: 2,
        totalPrice: 29.99
      },
      // Ajouter plus d'achats simulés...
    ]
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error)
  }
}

const handleSubmit = async (formData) => {
  try {
    if (selectedUser.value) {
      await usersAPI.update(selectedUser.value.id, formData)
      const index = users.value.findIndex(u => u.id === selectedUser.value.id)
      users.value[index] = { ...users.value[index], ...formData }
    } else {
      const response = await usersAPI.create(formData)
      users.value.push(response.data)
    }
    closeModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

const closeModal = () => {
  showAddModal.value = false
  selectedUser.value = null
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
  selectedUser.value = null
  userPurchases.value = []
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Chargement initial
loadUsers()
</script>
