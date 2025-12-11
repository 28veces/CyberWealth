<template>
  <div class="flex flex-col items-center justify-center h-full min-h-[60vh]" :class="{ 'overflow-hidden': showModal }">
    <div class="w-full max-w-2xl mx-auto px-4 py-4">
      <div class="flex justify-center mb-2">
        <ActionButtons 
          @back="goHome"
          @filter="toggleFiltros"
          @save="guardarCambios"
        />
      </div>
      <h1 class="text-2xl font-bold text-center mb-4">Ingresos</h1>

      <!-- Total de Ingreso Quincenal -->
      <div class="bg-white p-4 rounded-lg shadow mb-4">
        <h2 class="font-semibold mb-2">Total de Ingreso Quincenal</h2>
        <p class="text-2xl font-bold text-green-600">${{ totalIngresoQuincenal.toFixed(2) }}</p>
      </div>

      <!-- Filtros -->
      <div v-if="mostrarFiltros" class="bg-white p-4 rounded-lg shadow mb-4">
        <h3 class="font-semibold mb-2">Filtros</h3>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="filtro in ['Todos', 'Activos', 'Inactivos', 'Por monto']" 
            :key="filtro"
            @click="filtrarPor(filtro)"
            class="px-3 py-1 rounded-full text-sm"
            :class="filtroActual === filtro ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'"
          >
            {{ filtro }}
          </button>
        </div>
      </div>

      <!-- Botón agregar ingreso -->
      <button @click="showModal = true" class="mb-6 flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors">
        <Icon icon="mdi:plus" class="text-xl" />
        Agregar ingreso
      </button>

      <!-- Tabla de ingresos -->
      <table v-if="ingresosFiltrados.length" class="w-full max-w-lg bg-white rounded shadow text-sm">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-2">Monto</th>
            <th class="p-2">Descripción</th>
            <th class="p-2">Periodicidad</th>
            <th class="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(income, idx) in ingresosFiltrados" :key="idx" :class="income.active ? '' : 'opacity-50'">
            <td class="p-2">${{ income.amount }}</td>
            <td class="p-2">{{ income.description }}</td>
            <td class="p-2">{{ income.periodicity }}</td>
            <td class="p-2 flex gap-2">
              <button @click="editIncome(idx)" class="text-blue-600 hover:underline" title="Editar"><Icon icon="mdi:pencil" /></button>
              <button @click="deleteIncome(idx)" class="text-red-600 hover:underline" title="Eliminar"><Icon icon="mdi:delete" /></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-gray-500 mt-4">No hay ingresos registrados.</div>

      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg">
          <h2 class="text-lg font-bold mb-4">{{ editingIndex !== null ? 'Editar ingreso' : 'Agregar ingreso' }}</h2>
          <form @submit.prevent="saveIncome">
            <div class="mb-3">
              <label class="block text-sm mb-1">Monto</label>
              <input v-model.number="form.amount" type="number" min="0" step="0.01" class="w-full border rounded px-2 py-1" required />
            </div>
            <div class="mb-3">
              <label class="block text-sm mb-1">Descripción</label>
              <input v-model="form.description" type="text" class="w-full border rounded px-2 py-1" required />
            </div>
            <div class="mb-4">
              <label class="block text-sm mb-1">Periodicidad</label>
              <select v-model="form.periodicity" class="w-full border rounded px-2 py-1" required>
                <option value="15 días">Cada 15 días</option>
                <option value="1 mes">Cada mes</option>
              </select>
            </div>
            <div class="flex justify-end gap-2">
              <button type="button" @click="closeModal" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
              <button type="submit" class="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600">Aceptar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import ActionButtons from '~/components/ActionButtons.vue'
import { useFirestore } from '~/composables/useFirestore'

const router = useRouter()
function goHome() { router.push('/') }

// Usar Firestore en lugar de localStorage
const { items: incomes, loading, addItem, updateItem, fetchItems } = useFirestore('ingresos')

const showModal = ref(false)
const form = ref({ amount: '', description: '', periodicity: '15 días' })
const mostrarFiltros = ref(false)
const filtroActual = ref('Todos')
const editingIndex = ref(null)

// Calcular el total de ingreso quincenal considerando la periodicidad
const totalIngresoQuincenal = computed(() => {
  return incomes.value.reduce((total, ingreso) => {
    if (!ingreso.active) return total;
    const amount = ingreso.amount || 0;
    // Si la periodicidad es "1 mes", dividir entre 2 para obtener el valor quincenal
    if (ingreso.periodicity === '1 mes') {
      return total + (amount / 2);
    }
    return total + amount;
  }, 0);
})

const ingresosFiltrados = computed(() => {
  let items = [...incomes.value]
  switch (filtroActual.value) {
    case 'Activos':
      return items.filter(i => i.active)
    case 'Inactivos':
      return items.filter(i => !i.active)
    case 'Por monto':
      return items.sort((a, b) => b.amount - a.amount)
    default:
      return items
  }
})

async function saveIncome() {
  let result;
  
  if (editingIndex.value !== null) {
    // Editar ingreso existente
    const income = incomes.value[editingIndex.value];
    result = await updateItem(income.id, {
      amount: form.value.amount,
      description: form.value.description,
      periodicity: form.value.periodicity,
      active: income.active
    });
  } else {
    // Agregar nuevo ingreso
    result = await addItem({
      amount: form.value.amount,
      description: form.value.description,
      periodicity: form.value.periodicity,
      active: true
    });
  }
  
  if (result.success) {
    closeModal();
  } else {
    alert('Error al guardar: ' + result.error);
  }
}

function closeModal() {
  showModal.value = false;
  editingIndex.value = null;
  form.value = { amount: '', description: '', periodicity: '15 días' };
}

function editIncome(idx) {
  const income = ingresosFiltrados.value[idx];
  // Encontrar el índice real en el array original
  const realIndex = incomes.value.findIndex(i => i.id === income.id);
  form.value = {
    amount: income.amount,
    description: income.description,
    periodicity: income.periodicity
  };
  editingIndex.value = realIndex;
  showModal.value = true;
}

async function deleteIncome(idx) {
  if (confirm('¿Estás seguro de eliminar este ingreso?')) {
    const income = ingresosFiltrados.value[idx];
    const { deleteItem: deleteIncome } = useFirestore('ingresos');
    const result = await deleteIncome(income.id);
    if (result.success) {
      await fetchItems();
    } else {
      alert('Error al eliminar: ' + result.error);
    }
  }
}

function toggleFiltros() {
  mostrarFiltros.value = !mostrarFiltros.value
}

function filtrarPor(filtro) {
  filtroActual.value = filtro
}

function guardarCambios() {
  // Ya no es necesario, Firestore guarda automáticamente
  alert('Los cambios se guardan automáticamente en la nube')
}

// Cargar ingresos al montar el componente
onMounted(async () => {
  await fetchItems()
})
</script>
