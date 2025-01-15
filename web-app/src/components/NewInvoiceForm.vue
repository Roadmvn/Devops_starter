<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Informations client -->
    <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Client</h3>
          <p class="mt-1 text-sm text-gray-500">
            Informations du client pour la facture.
          </p>
        </div>
        <div class="mt-5 md:mt-0 md:col-span-2">
          <div class="grid grid-cols-6 gap-6">
            <div class="col-span-6 sm:col-span-3">
              <label for="clientName" class="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                id="clientName"
                v-model="formData.client.name"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div class="col-span-6 sm:col-span-3">
              <label for="clientEmail" class="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="clientEmail"
                v-model="formData.client.email"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div class="col-span-6">
              <label for="clientAddress" class="block text-sm font-medium text-gray-700">Adresse</label>
              <textarea
                id="clientAddress"
                v-model="formData.client.address"
                rows="3"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Articles -->
    <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Articles</h3>
          <p class="mt-1 text-sm text-gray-500">
            Ajoutez les articles à la facture.
          </p>
        </div>
        <div class="mt-5 md:mt-0 md:col-span-2">
          <div class="space-y-4">
            <div v-for="(item, index) in formData.items" :key="index" class="border-b pb-4">
              <div class="grid grid-cols-6 gap-6">
                <div class="col-span-6 sm:col-span-3">
                  <label :for="'item-name-' + index" class="block text-sm font-medium text-gray-700">Produit</label>
                  <select
                    :id="'item-name-' + index"
                    v-model="item.productId"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    @change="updateItemPrice(index)"
                  >
                    <option value="">Sélectionner un produit</option>
                    <option v-for="product in products" :key="product.id" :value="product.id">
                      {{ product.name }} - {{ formatPrice(product.price) }}
                    </option>
                  </select>
                </div>

                <div class="col-span-6 sm:col-span-1">
                  <label :for="'item-quantity-' + index" class="block text-sm font-medium text-gray-700">Quantité</label>
                  <input
                    type="number"
                    :id="'item-quantity-' + index"
                    v-model.number="item.quantity"
                    required
                    min="1"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    @change="updateItemTotal(index)"
                  />
                </div>

                <div class="col-span-6 sm:col-span-1">
                  <label :for="'item-price-' + index" class="block text-sm font-medium text-gray-700">Prix unitaire</label>
                  <input
                    type="number"
                    :id="'item-price-' + index"
                    v-model.number="item.unitPrice"
                    required
                    step="0.01"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    @change="updateItemTotal(index)"
                  />
                </div>

                <div class="col-span-6 sm:col-span-1">
                  <label class="block text-sm font-medium text-gray-700">Total</label>
                  <p class="mt-2 text-sm text-gray-500">{{ formatPrice(item.total) }}</p>
                </div>

                <div v-if="index > 0" class="col-span-6 flex justify-end">
                  <button
                    type="button"
                    @click="removeItem(index)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="addItem"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ajouter un article
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Totaux -->
    <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Totaux</h3>
          <p class="mt-1 text-sm text-gray-500">
            Récapitulatif des montants.
          </p>
        </div>
        <div class="mt-5 md:mt-0 md:col-span-2">
          <dl class="grid grid-cols-6 gap-6">
            <div class="col-span-6 sm:col-span-2">
              <dt class="text-sm font-medium text-gray-500">Total HT</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatPrice(subtotal) }}</dd>
            </div>
            <div class="col-span-6 sm:col-span-2">
              <dt class="text-sm font-medium text-gray-500">TVA ({{ formData.taxRate }}%)</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatPrice(taxAmount) }}</dd>
            </div>
            <div class="col-span-6 sm:col-span-2">
              <dt class="text-sm font-medium text-gray-500">Total TTC</dt>
              <dd class="mt-1 text-lg font-bold text-gray-900">{{ formatPrice(total) }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Notes</h3>
          <p class="mt-1 text-sm text-gray-500">
            Ajoutez des notes ou commentaires à la facture.
          </p>
        </div>
        <div class="mt-5 md:mt-0 md:col-span-2">
          <textarea
            v-model="formData.notes"
            rows="4"
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>
      </div>
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
        Créer la facture
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()

const props = defineProps({
  products: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  client: {
    name: '',
    email: '',
    address: ''
  },
  items: [
    {
      productId: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
  ],
  taxRate: 20,
  notes: ''
})

const addItem = () => {
  formData.value.items.push({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  })
}

const removeItem = (index) => {
  formData.value.items.splice(index, 1)
}

const updateItemPrice = (index) => {
  const item = formData.value.items[index]
  const product = props.products.find(p => p.id === item.productId)
  if (product) {
    item.unitPrice = product.price
    updateItemTotal(index)
  }
}

const updateItemTotal = (index) => {
  const item = formData.value.items[index]
  item.total = item.quantity * item.unitPrice
}

const subtotal = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + item.total, 0)
})

const taxAmount = computed(() => {
  return subtotal.value * (formData.value.taxRate / 100)
})

const total = computed(() => {
  return subtotal.value + taxAmount.value
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const handleSubmit = () => {
  if (formData.value.items.some(item => !item.productId)) {
    notificationStore.error('Veuillez sélectionner tous les produits')
    return
  }

  emit('submit', {
    ...formData.value,
    subtotal: subtotal.value,
    taxAmount: taxAmount.value,
    total: total.value
  })
}
</script>
