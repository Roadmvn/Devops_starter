<template>
  <div class="space-y-6">
    <!-- Cartes de statistiques -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.name"
        class="bg-white overflow-hidden shadow rounded-lg"
      >
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <component
                :is="stat.icon"
                class="h-6 w-6 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ stat.name }}
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stat.value }}
                  </div>
                  <div
                    :class="[
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                      'ml-2 flex items-baseline text-sm font-semibold'
                    ]"
                  >
                    <component
                      :is="stat.changeType === 'increase' ? 'ArrowUpIcon' : 'ArrowDownIcon'"
                      class="self-center flex-shrink-0 h-5 w-5"
                      aria-hidden="true"
                    />
                    <span class="ml-1"> {{ stat.change }} </span>
                    <span class="sr-only">
                      {{ stat.changeType === 'increase' ? 'Augmentation' : 'Diminution' }}
                    </span>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <SalesChart
        title="Chiffre d'affaires"
        :data="salesData"
      />
      <SalesChart
        title="Nombre de ventes"
        :data="ordersData"
      />
    </div>

    <!-- Produits les plus vendus -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Produits les plus vendus
        </h3>
        <button
          type="button"
          class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Voir tout
        </button>
      </div>
      <div class="flex flex-col">
        <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div class="overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Produit
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Catégorie
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ventes
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Revenu
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="product in topProducts" :key="product.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0">
                          <img
                            class="h-10 w-10 rounded-full"
                            :src="product.image"
                            :alt="product.name"
                          />
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">
                            {{ product.name }}
                          </div>
                          <div class="text-sm text-gray-500">
                            #{{ product.id }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="getCategoryClass(product.category)"
                      >
                        {{ product.category }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ product.sales }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatPrice(product.revenue) }}
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
</template>

<script setup>
import { ref } from 'vue'
import SalesChart from './SalesChart.vue'
import {
  CurrencyEuroIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  TrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/vue/outline'

const stats = ref([
  {
    name: 'Chiffre d\'affaires total',
    value: '54,764 €',
    change: '12%',
    changeType: 'increase',
    icon: CurrencyEuroIcon
  },
  {
    name: 'Commandes',
    value: '376',
    change: '5.4%',
    changeType: 'increase',
    icon: ShoppingCartIcon
  },
  {
    name: 'Clients actifs',
    value: '156',
    change: '2.3%',
    changeType: 'decrease',
    icon: UserGroupIcon
  },
  {
    name: 'Taux de conversion',
    value: '24.57%',
    change: '3.2%',
    changeType: 'increase',
    icon: TrendingUpIcon
  }
])

const salesData = ref({
  week: {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    values: [2100, 1800, 2400, 2800, 3200, 2900, 2600]
  },
  month: {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    values: [9800, 11200, 10400, 12600]
  },
  year: {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    values: [42000, 38000, 45000, 50000, 49000, 54000, 52000, 51000, 48000, 54000, 52000, 55000]
  }
})

const ordersData = ref({
  week: {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    values: [45, 38, 52, 58, 65, 57, 48]
  },
  month: {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    values: [180, 220, 195, 245]
  },
  year: {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    values: [820, 750, 880, 950, 920, 1020, 980, 960, 910, 1050, 990, 1100]
  }
})

const topProducts = ref([
  {
    id: 'PRD001',
    name: 'Café Bio Arabica',
    category: 'Boissons',
    sales: 234,
    revenue: 1872,
    image: 'https://via.placeholder.com/40'
  },
  {
    id: 'PRD002',
    name: 'Pain complet',
    category: 'Boulangerie',
    sales: 189,
    revenue: 567,
    image: 'https://via.placeholder.com/40'
  },
  {
    id: 'PRD003',
    name: 'Yaourt nature',
    category: 'Produits laitiers',
    sales: 156,
    revenue: 312,
    image: 'https://via.placeholder.com/40'
  },
  {
    id: 'PRD004',
    name: 'Pommes Bio',
    category: 'Fruits',
    sales: 145,
    revenue: 435,
    image: 'https://via.placeholder.com/40'
  },
  {
    id: 'PRD005',
    name: 'Chocolat noir 70%',
    category: 'Confiserie',
    sales: 134,
    revenue: 536,
    image: 'https://via.placeholder.com/40'
  }
])

const getCategoryClass = (category) => {
  const classes = {
    'Boissons': 'bg-blue-100 text-blue-800',
    'Boulangerie': 'bg-yellow-100 text-yellow-800',
    'Produits laitiers': 'bg-green-100 text-green-800',
    'Fruits': 'bg-red-100 text-red-800',
    'Confiserie': 'bg-purple-100 text-purple-800'
  }
  return classes[category] || 'bg-gray-100 text-gray-800'
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}
</script>
