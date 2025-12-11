<template>
  <div class="flex flex-col min-h-screen w-full overflow-y-auto">
    <div class="w-full max-w-md mx-auto px-4 py-4">
      <div class="flex justify-between items-center mb-4">
        <button @click="goBack" class="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
          <Icon icon="mdi:arrow-left" class="text-3xl text-blue-700" />
        </button>
        <div class="flex gap-2">
          <button class="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
            <Icon icon="mdi:filter-variant" class="text-xl text-blue-700" />
          </button>
          <button class="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
            <Icon icon="mdi:content-save" class="text-xl text-blue-700" />
          </button>
        </div>
      </div>
      
      <template v-if="accountExists">
        <h1 class="text-2xl font-bold mb-4">{{ account.name }}</h1>
        <div class="mb-4 w-full max-w-xs">
          <div class="flex flex-col gap-2 bg-blue-50 p-4 rounded shadow">
            <div class="flex justify-between items-center">
              <span class="font-semibold">Balance estimado:</span>
              <span class="text-green-700 font-bold">${{ account.balance || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="font-semibold">Balance real:</span>
              <input 
                :value="account.realBalance" 
                @input="updateRealBalance($event.target.value)" 
                type="number" 
                min="0" 
                step="0.01" 
                class="border rounded px-2 py-1 w-32 text-right" 
              />
            </div>
            <div class="flex justify-between items-center">
              <span class="font-semibold">Diferencia:</span>
              <span :class="{'text-red-600': diff < 0, 'text-green-600': diff >= 0}">${{ diff }}</span>
            </div>
          </div>
        </div>
        <form @submit.prevent="addDeposit" class="mb-6 w-full max-w-xs">
          <div class="mb-3">
            <label class="block text-sm mb-1">Monto del depósito</label>
            <input v-model.number="deposit.amount" type="number" min="0" step="0.01" class="w-full border rounded px-2 py-1" required />
          </div>
          <div class="mb-3">
            <label class="block text-sm mb-1">Fecha</label>
            <input v-model="deposit.date" type="date" class="w-full border rounded px-2 py-1" required />
          </div>
          <div class="flex justify-end">
            <button type="submit" class="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600">Registrar</button>
          </div>
        </form>
        <h2 class="font-semibold text-lg mb-2">Histórico de depósitos</h2>
        <table v-if="account.history?.length" class="w-full max-w-md bg-white rounded shadow text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2">Fecha</th>
              <th class="p-2">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in paginatedHistory" :key="idx">
              <td class="p-2">{{ item.date }}</td>
              <td class="p-2">${{ item.amount }}</td>
            </tr>
          </tbody>
        </table>
        <!-- Paginación -->
        <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-4">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            :class="{'opacity-50 cursor-not-allowed': currentPage === 1}"
            class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Icon icon="mdi:chevron-left" />
          </button>
          <span class="px-3 py-1">{{ currentPage }} / {{ totalPages }}</span>
          <button 
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            :class="{'opacity-50 cursor-not-allowed': currentPage === totalPages}"
            class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Icon icon="mdi:chevron-right" />
          </button>
        </div>
        <div v-else-if="!account.history?.length" class="text-gray-500 mt-2">No hay depósitos registrados.</div>
      </template>
      <template v-else>
        <div class="text-red-600 font-bold text-lg">Cuenta no encontrada o eliminada.</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'
import { useFirestore } from '~/composables/useFirestore'

const router = useRouter()
const route = useRoute()

const type = route.params.type
const accountId = route.params.idx
const collection = type === 'ahorro' ? 'ahorros' : 'inversiones'

// Usar Firestore
const { items: accounts, updateItem, fetchItems } = useFirestore(collection)

const account = computed(() => accounts.value.find(a => a.id === accountId))
const accountExists = computed(() => account.value !== null)
const deposit = ref({ amount: '', date: '' })
const loading = ref(true)

// Cargar cuenta al montar
onMounted(async () => {
  await fetchItems()
  loading.value = false
  if (!accountExists.value) {
    alert('Cuenta no encontrada')
    router.push('/ahorros-inversiones')
  }
})

// Paginación
const currentPage = ref(1)
const itemsPerPage = 10

const paginatedHistory = computed(() => {
  if (!account.value?.history) return []
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return account.value.history.slice(start, end)
})

const totalPages = computed(() => {
  if (!account.value?.history) return 0
  return Math.ceil(account.value.history.length / itemsPerPage)
})

// Resetear página cuando cambie la cuenta
watch(() => account.value, () => {
  currentPage.value = 1
})

function goBack() { router.back() }

async function addDeposit() {
  if (!deposit.value.amount || !deposit.value.date || !accountExists.value) return
  
  const currentHistory = account.value.history || []
  const newBalance = (account.value.balance || 0) + Number(deposit.value.amount)
  
  const result = await updateItem(account.value.id, {
    history: [...currentHistory, {
      amount: deposit.value.amount,
      date: deposit.value.date
    }],
    balance: newBalance,
    lastUpdate: deposit.value.date
  })
  
  if (result.success) {
    deposit.value = { amount: '', date: '' }
  } else {
    alert('Error al registrar depósito: ' + result.error)
  }
}

async function updateRealBalance(newBalance) {
  if (!accountExists.value) return
  
  const result = await updateItem(account.value.id, {
    realBalance: Number(newBalance)
  })
  
  if (!result.success) {
    alert('Error al actualizar balance: ' + result.error)
  }
}

const diff = computed(() => {
  if (!accountExists.value) return '0.00'
  const real = Number(account.value.realBalance || 0)
  const estimado = Number(account.value.balance || 0)
  return (real - estimado).toFixed(2)
})
</script>
