<template>
  <div class="flex flex-col min-h-screen w-full overflow-y-auto" :class="{ 'overflow-hidden': showModal }">
    <div class="w-full max-w-2xl mx-auto px-4 py-4">
      <div class="flex justify-center mb-2">
        <ActionButtons 
          @back="goHome"
          @filter="toggleFiltros"
          @save="guardarCambios"
        />
      </div>
      <h1 class="text-2xl font-bold text-center mb-4">Ahorros / Inversiones</h1>

      <!-- Filtros -->
      <div v-if="mostrarFiltros" class="bg-white p-4 rounded-lg shadow mb-4">
        <h3 class="font-semibold mb-2">Filtros</h3>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="tipo in ['Todos', 'Mayor balance', 'Menor balance']" 
            :key="tipo"
            @click="filtrarPorTipo(tipo)"
            class="px-3 py-1 rounded-full text-sm"
            :class="filtroActual === tipo ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'"
          >
            {{ tipo }}
          </button>
        </div>
      </div>

      <!-- Botón agregar cuenta -->
      <button @click="showModal = true" class="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors">
        <Icon icon="mdi:plus" class="text-xl" />
        Agregar cuenta
      </button>

      <!-- Tablas de ahorro e inversión -->
      <div class="w-full max-w-2xl grid grid-cols-1 gap-6">
        <div>
          <!-- Tabla de ahorros -->
          <div class="flex justify-between items-center mb-2">
            <h2 class="font-semibold text-lg">Ahorros</h2>
            <span class="text-green-600 font-bold">
              Total: ${{ savings.reduce((sum, item) => sum + (item.balance || 0), 0).toFixed(2) }}
            </span>
          </div>
          <table v-if="savingsFiltrados.length" class="w-full bg-white rounded shadow text-sm">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-2">Nombre</th>
                <th class="p-2">Balance</th>
                <th class="p-2">Última actualización</th>
                <th class="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in savingsFiltrados" :key="idx">
                <td class="p-2">{{ item.name }}</td>
                <td class="p-2">${{ item.balance }}</td>
                <td class="p-2">{{ item.lastUpdate }}</td>
                <td class="p-2 flex gap-4 items-center">
                  <button @click="openAddFundsModal('ahorro', idx)" class="text-blue-600 hover:underline flex items-center gap-1 text-lg">
                    <Icon icon="mdi:cash-plus" />
                  </button>
                  <button @click="deleteAccount('ahorro', idx)" class="text-red-600 hover:underline flex items-center gap-1 text-lg">
                    <Icon icon="mdi:delete" />
                  </button>
                  <button @click="openTransactionDetails('ahorro', idx)" class="text-green-600 hover:underline flex items-center gap-1 text-lg">
                    <Icon icon="mdi:clipboard-list-outline" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="text-gray-500 mt-2">No hay cuentas de ahorro.</div>
        </div>

        <div>
          <!-- Tabla de inversiones -->
          <div class="flex justify-between items-center mb-2">
            <h2 class="font-semibold text-lg">Inversiones</h2>
            <span class="text-green-600 font-bold">
              Total: ${{ investments.reduce((sum, item) => sum + (item.balance || 0), 0).toFixed(2) }}
            </span>
          </div>
          <table v-if="investmentsFiltrados.length" class="w-full bg-white rounded shadow text-sm">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-2">Nombre</th>
                <th class="p-2">Balance</th>
                <th class="p-2">Última actualización</th>
                <th class="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in investmentsFiltrados" :key="idx">
                <td class="p-2">{{ item.name }}</td>
                <td class="p-2">${{ item.balance }}</td>
                <td class="p-2">{{ item.lastUpdate }}</td>
                <td class="p-2 flex gap-4 items-center">
                  <button @click="openAddFundsModal('inversion', idx)" class="text-blue-600 hover:underline flex items-center gap-1 text-lg">
                    <Icon icon="mdi:cash-plus" />
                  </button>
                  <button @click="deleteAccount('inversion', idx)" class="text-red-600 hover:underline flex items-center gap-1 text-lg">
                    <Icon icon="mdi:delete" />
                  </button>
                  <button @click="openTransactionDetails('inversion', idx)" class="text-green-600 hover:underline flex items-center gap-1 text-lg">
                    <Icon icon="mdi:clipboard-list-outline" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="text-gray-500 mt-2">No hay cuentas de inversión.</div>
        </div>
      </div>

      <!-- Modal para agregar cuenta -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg">
          <h2 class="text-lg font-bold mb-4">Agregar cuenta</h2>
          <form @submit.prevent="addAccount">
            <div class="mb-3">
              <label class="block text-sm mb-1">Nombre de la cuenta</label>
              <input v-model="form.name" type="text" class="w-full border rounded px-2 py-1" required />
            </div>
            <div class="mb-3">
              <label class="block text-sm mb-1">Tipo</label>
              <select v-model="form.type" class="w-full border rounded px-2 py-1" required>
                <option value="ahorro">Ahorro</option>
                <option value="inversion">Inversión</option>
              </select>
            </div>
            <div class="flex justify-end gap-2">
              <button type="button" @click="closeModal" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
              <button type="submit" class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">Aceptar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para agregar fondos -->
      <div v-if="showAddFundsModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg">
          <h2 class="text-lg font-bold mb-4">Registrar Transacción</h2>
          <form @submit.prevent="addFunds">
            <div class="mb-3">
              <label class="block text-sm mb-1">Tipo de Transacción</label>
              <select v-model="fundsTransactionType" class="w-full border rounded px-2 py-1" required>
                <option value="deposit">Agregar</option>
                <option value="withdraw">Retirar</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="block text-sm mb-1">Monto</label>
              <input v-model.number="fundsAmount" type="number" min="0" step="0.01" class="w-full border rounded px-2 py-1" required />
            </div>
            <div class="flex justify-end gap-2">
              <button type="button" @click="closeAddFundsModal" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
              <button type="submit" class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">Aceptar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para detalles de transacciones -->
      <div v-if="showTransactionDetailsModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
          <h2 class="text-lg font-bold mb-4">Historial de Transacciones</h2>
          <table class="w-full bg-white rounded shadow text-sm">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-2">Fecha</th>
                <th class="p-2">Hora</th>
                <th class="p-2">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(transaction, idx) in selectedTransactionDetails" :key="idx">
                <td class="p-2">{{ transaction.date }}</td>
                <td class="p-2">{{ transaction.time }}</td>
                <td class="p-2">${{ transaction.amount }}</td>
              </tr>
            </tbody>
          </table>
          <div class="flex justify-end mt-4">
            <button @click="closeTransactionDetailsModal" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import ActionButtons from '~/components/ActionButtons.vue'
import { useFirestore } from '~/composables/useFirestore'

const router = useRouter()
function goHome() { router.push('/') }

// Usar Firestore para ahorros e inversiones
const { items: savings, addItem: addSaving, fetchItems: fetchSavings } = useFirestore('ahorros')
const { items: investments, addItem: addInvestment, fetchItems: fetchInvestments } = useFirestore('inversiones')

const showModal = ref(false)
const form = ref({ name: '', type: 'ahorro' })
const mostrarFiltros = ref(false)
const filtroActual = ref('Todos')
const showAddFundsModal = ref(false)
const fundsAmount = ref(0)
const fundsTransactionType = ref('deposit'); // 'deposit' o 'withdraw'
const selectedAccountType = ref('')
const selectedAccountIndex = ref(null)
const showTransactionDetailsModal = ref(false);
const selectedTransactionDetails = ref([]);

const savingsFiltrados = computed(() => {
  let items = [...savings.value]
  if (filtroActual.value === 'Mayor balance') {
    items.sort((a, b) => b.balance - a.balance)
  } else if (filtroActual.value === 'Menor balance') {
    items.sort((a, b) => a.balance - b.balance)
  }
  return items
})

const investmentsFiltrados = computed(() => {
  let items = [...investments.value]
  if (filtroActual.value === 'Mayor balance') {
    items.sort((a, b) => b.balance - a.balance)
  } else if (filtroActual.value === 'Menor balance') {
    items.sort((a, b) => a.balance - b.balance)
  }
  return items
})

async function addAccount() {
  const newAccount = {
    name: form.value.name,
    type: form.value.type,
    balance: 0,
    realBalance: 0,
    lastUpdate: new Date().toLocaleDateString(),
    history: []
  }
  
  let result
  if (form.value.type === 'ahorro') {
    result = await addSaving(newAccount)
  } else {
    result = await addInvestment(newAccount)
  }
  
  if (result.success) {
    closeModal()
    form.value = { name: '', type: 'ahorro' }
  } else {
    alert('Error al guardar: ' + result.error)
  }
}

function openAddFundsModal(type, idx) {
  const accountList = type === 'ahorro' ? savings.value : investments.value;
  if (!accountList[idx]) {
    alert('La cuenta seleccionada no existe.');
    return;
  }
  selectedAccountType.value = type;
  selectedAccountIndex.value = idx;
  showAddFundsModal.value = true;
}

function closeAddFundsModal() {
  showAddFundsModal.value = false
  fundsAmount.value = 0
  selectedAccountType.value = ''
  selectedAccountIndex.value = null
}

async function addFunds() {
  const accountList = selectedAccountType.value === 'ahorro' ? savings.value : investments.value;
  const account = accountList[selectedAccountIndex.value];

  if (!account) {
    alert('La cuenta seleccionada no existe.');
    closeAddFundsModal();
    return;
  }

  const transactionType = fundsTransactionType.value; // 'deposit' o 'withdraw'
  const transactionAmount = transactionType === 'withdraw' ? -fundsAmount.value : fundsAmount.value;

  if (transactionType === 'withdraw' && account.balance < fundsAmount.value) {
    alert('No hay suficiente saldo para realizar el retiro.');
    return;
  }

  const transaction = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    amount: transactionAmount,
    type: transactionType
  };

  const updatedAccount = {
    ...account,
    balance: account.balance + transactionAmount,
    history: [...(account.history || []), transaction]
  };

  const updateItem = selectedAccountType.value === 'ahorro' ? useFirestore('ahorros').updateItem : useFirestore('inversiones').updateItem;
  const result = await updateItem(updatedAccount.id, updatedAccount);

  if (result.success) {
    closeAddFundsModal();
  } else {
    alert('Error al actualizar la cuenta: ' + result.error);
  }
}

function deleteAccount(type, idx) {
  const accountList = type === 'ahorro' ? savings.value : investments.value;
  const account = accountList[idx];

  if (!account) {
    alert('La cuenta seleccionada no existe.');
    return;
  }

  const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar la cuenta "${account.name}"? Esta acción no se puede deshacer.`);
  if (confirmDelete) {
    const deleteItem = type === 'ahorro' ? useFirestore('ahorros').deleteItem : useFirestore('inversiones').deleteItem;
    deleteItem(account.id)
      .then(() => {
        alert('Cuenta eliminada con éxito.');
      })
      .catch(error => {
        alert('Error al eliminar la cuenta: ' + error);
      });
  }
}

function openTransactionDetails(type, idx) {
  const accountList = type === 'ahorro' ? savings.value : investments.value;
  const account = accountList[idx];

  if (!account) {
    alert('La cuenta seleccionada no existe.');
    return;
  }

  selectedTransactionDetails.value = account.history || [];
  showTransactionDetailsModal.value = true;
}

function closeTransactionDetailsModal() {
  showTransactionDetailsModal.value = false;
  selectedTransactionDetails.value = [];
}

function guardarCambios() {
  alert('Los cambios se guardan automáticamente en la nube');
}

function toggleFiltros() {
  mostrarFiltros.value = !mostrarFiltros.value;
}

onMounted(() => {
  fetchSavings()
  fetchInvestments()
})
</script>

<style scoped>
/* Agregar estilos específicos aquí si es necesario */
</style>
