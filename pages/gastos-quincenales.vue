<template>
  <div class="flex flex-col min-h-screen w-full overflow-y-auto">
    <div class="w-full max-w-2xl mx-auto px-4 py-4">
      <div class="flex justify-center mb-2">
        <ActionButtons 
          @back="goHome"
          @filter="toggleFiltros"
          @save="guardarCambios"
        />
      </div>
      <h1 class="text-2xl font-bold text-center mb-4">Gastos Quincenales</h1>

      <!-- Resumen quincenal -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="font-semibold mb-2">Ingreso Quincenal</h2>
          <div class="flex justify-between items-center">
            <span class="text-2xl font-bold text-green-600">${{ ingresoQuincenal }}</span>
            <button @click="showIngresoModal = true" class="text-blue-600">
              <Icon icon="mdi:pencil" class="text-xl" />
            </button>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="font-semibold mb-2">Deudas Quincenales</h2>
          <span class="text-2xl font-bold text-red-600">${{ deudasQuincenales }}</span>
        </div>
      </div>

      <!-- Saldo Disponible -->
      <div class="bg-blue-50 p-4 rounded-lg shadow mb-6">
        <div class="flex justify-between items-center">
          <h2 class="font-semibold">Saldo Disponible</h2>
          <span class="text-2xl font-bold" :class="{'text-green-600': saldoDisponible > 0, 'text-red-600': saldoDisponible <= 0}">
            ${{ saldoDisponible }}
          </span>
        </div>
      </div>

      <!-- Botón agregar gasto -->
      <button @click="showModal = true" class="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors">
        <Icon icon="mdi:plus" class="text-xl" />
        Agregar Gasto
      </button>

      <!-- Tabla de gastos -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <h2 class="font-semibold p-4 border-b">Listado de Gastos</h2>
        <table v-if="gastos.length" class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th class="p-2 text-left">Concepto</th>
              <th class="p-2 text-right">Monto</th>
              <th class="p-2 text-center">Categoría</th>
              <th class="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(gasto, idx) in gastos" :key="idx" class="border-t">
              <td class="p-2">{{ gasto.concepto }}</td>
              <td class="p-2 text-right">${{ gasto.monto }}</td>
              <td class="p-2 text-center">
                <span class="px-2 py-1 rounded-full text-xs" :class="getCategoriaClase(gasto.categoria)">
                  {{ gasto.categoria }}
                </span>
              </td>
              <td class="p-2">
                <div class="flex justify-center gap-2">
                  <button @click="editarGasto(idx)" class="text-blue-600 hover:text-blue-800">
                    <Icon icon="mdi:pencil" />
                  </button>
                  <button @click="eliminarGasto(idx)" class="text-red-600 hover:text-red-800">
                    <Icon icon="mdi:delete" />
                  </button>
                </div>
              </td>
            </tr>
            <tr class="border-t bg-gray-50 font-semibold">
              <td class="p-2">Total</td>
              <td class="p-2 text-right">${{ totalGastos }}</td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="p-4 text-center text-gray-500">
          No hay gastos registrados.
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar gasto -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 class="text-lg font-bold mb-4">{{ editandoIdx !== null ? 'Editar' : 'Agregar' }} Gasto</h2>
        <form @submit.prevent="guardarGasto">
          <div class="mb-3">
            <label class="block text-sm mb-1">Concepto</label>
            <input v-model="form.concepto" type="text" class="w-full border rounded px-2 py-1" required />
          </div>
          <div class="mb-3">
            <label class="block text-sm mb-1">Monto</label>
            <input v-model.number="form.monto" type="number" min="0" step="0.01" class="w-full border rounded px-2 py-1" required />
          </div>
          <div class="mb-4">
            <label class="block text-sm mb-1">Categoría</label>
            <select v-model="form.categoria" class="w-full border rounded px-2 py-1" required>
              <option value="Fijo">Fijo</option>
              <option value="Variable">Variable</option>
              <option value="Ocasional">Ocasional</option>
            </select>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="closeModal" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">
              {{ editandoIdx !== null ? 'Guardar Cambios' : 'Agregar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para editar ingreso quincenal -->
    <div v-if="showIngresoModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 class="text-lg font-bold mb-4">Editar Ingreso Quincenal</h2>
        <form @submit.prevent="guardarIngreso">
          <div class="mb-4">
            <label class="block text-sm mb-1">Monto</label>
            <input v-model.number="nuevoIngreso" type="number" min="0" step="0.01" class="w-full border rounded px-2 py-1" required />
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showIngresoModal = false" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import ActionButtons from '~/components/ActionButtons.vue'
import { useRouter } from 'vue-router'
import { useFirestore } from '~/composables/useFirestore'

const router = useRouter()

// Usar Firestore
const { items: gastos, addItem, updateItem, deleteItem, fetchItems } = useFirestore('gastosQuincenales')
const { items: configuracion, addItem: addConfig, updateItem: updateConfig, fetchItems: fetchConfig } = useFirestore('configuracion')
const { items: deudas, fetchItems: fetchDeudas } = useFirestore('deudas')
const { items: ingresos, fetchItems: fetchIngresos } = useFirestore('ingresos')

const showModal = ref(false)
const showIngresoModal = ref(false)
const editandoGasto = ref(null)
const ingresoQuincenalManual = ref(0)
const nuevoIngreso = ref(0)

const form = ref({
  concepto: '',
  monto: '',
  categoria: 'Fijo'
})

// Cargar datos desde Firestore
onMounted(async () => {
  await Promise.all([
    fetchItems(),
    fetchConfig(),
    fetchDeudas()
  ])
  
  // Cargar ingreso quincenal de la configuración
  const ingresoConfig = configuracion.value.find(c => c.tipo === 'ingresoQuincenal')
  if (ingresoConfig) {
    ingresoQuincenal.value = ingresoConfig.valor
  }
})

// Calculamos el total de deudas quincenales desde Firestore
const deudasQuincenales = computed(() => {
  return deudas.value.reduce((sum, deuda) => {
    // Convertimos el pago mensual a quincenal
    const pagoQuincenal = (deuda.cuotaMensual || 0) / 2
    return sum + pagoQuincenal
  }, 0).toFixed(2)
})

const totalGastos = computed(() => {
  return gastos.value.reduce((sum, gasto) => sum + gasto.monto, 0).toFixed(2)
})

const saldoDisponible = computed(() => {
  return (ingresoQuincenal.value - parseFloat(deudasQuincenales.value) - parseFloat(totalGastos.value)).toFixed(2)
})

function goHome() {
  router.push('/')
}

function getCategoriaClase(categoria) {
  switch (categoria) {
    case 'Fijo':
      return 'bg-blue-100 text-blue-800'
    case 'Variable':
      return 'bg-yellow-100 text-yellow-800'
    case 'Ocasional':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

async function guardarGasto() {
  let result
  
  if (editandoGasto.value) {
    result = await updateItem(editandoGasto.value.id, form.value)
  } else {
    result = await addItem(form.value)
  }
  
  if (result.success) {
    closeModal()
  } else {
    alert('Error al guardar: ' + result.error)
  }
}

function editarGasto(idx) {
  editandoGasto.value = gastos.value[idx]
  form.value = { ...gastos.value[idx] }
  showModal.value = true
}

async function eliminarGasto(idx) {
  if (confirm('¿Estás seguro de eliminar este gasto?')) {
    const gasto = gastos.value[idx]
    const result = await deleteItem(gasto.id)
    if (!result.success) {
      alert('Error al eliminar: ' + result.error)
    }
  }
}

function closeModal() {
  showModal.value = false
  editandoGasto.value = null
  form.value = {
    concepto: '',
    monto: '',
    categoria: 'Fijo'
  }
}

async function guardarIngreso() {
  ingresoQuincenal.value = nuevoIngreso.value
  
  // Buscar si ya existe la configuración
  const ingresoConfig = configuracion.value.find(c => c.tipo === 'ingresoQuincenal')
  
  let result
  if (ingresoConfig) {
    result = await updateConfig(ingresoConfig.id, { 
      tipo: 'ingresoQuincenal', 
      valor: nuevoIngreso.value 
    })
  } else {
    result = await addConfig({ 
      tipo: 'ingresoQuincenal', 
      valor: nuevoIngreso.value 
    })
  }
  
  if (result.success) {
    showIngresoModal.value = false
  } else {
    alert('Error al guardar ingreso: ' + result.error)
  }
}
</script>
