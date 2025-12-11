<template>
  <div class="flex flex-col min-h-screen w-full overflow-y-auto" :class="{ 'overflow-hidden': showModal }">
    <div class="w-full max-w-4xl mx-auto px-4 py-4">
      <div class="flex justify-center mb-2">
        <ActionButtons 
          @back="goHome"
          @save="guardarCambios"
        />
      </div>
      <h1 class="text-2xl font-bold text-center mb-4">Presupuesto</h1>

      <!-- Selector de fecha -->
      <div class="bg-white p-4 rounded-lg shadow mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Fecha del presupuesto:</label>
        <input 
          v-model="fechaPresupuesto" 
          type="date" 
          class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          @change="cargarPresupuesto"
        />
      </div>

      <!-- Resumen -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="p-4 bg-green-50 rounded-lg shadow">
          <div class="text-sm text-gray-600">Estimado Total</div>
          <div class="text-2xl font-bold text-green-600">${{ totalEstimado.toFixed(2) }}</div>
        </div>
        <div class="p-4 bg-blue-50 rounded-lg shadow">
          <div class="text-sm text-gray-600">Pagado</div>
          <div class="text-2xl font-bold text-blue-600">${{ totalPagado.toFixed(2) }}</div>
        </div>
      </div>

      <div class="p-4 rounded-lg shadow mb-6" :class="restante >= 0 ? 'bg-green-50' : 'bg-red-50'">
        <div class="text-sm text-gray-600">Restante</div>
        <div class="text-2xl font-bold" :class="restante >= 0 ? 'text-green-600' : 'text-red-600'">
          ${{ restante.toFixed(2) }}
        </div>
      </div>

      <button @click="showModal = true" class="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors">
        <Icon icon="mdi:plus" class="text-xl" />
        Agregar Gasto
      </button>

      <!-- Tabla de gastos presupuestados -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <h2 class="font-semibold p-4 border-b">Gastos Presupuestados</h2>
        <div v-if="gastosPresupuestados.length">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-3 text-left">Descripción</th>
                <th class="p-3 text-right">Estimado</th>
                <th class="p-3 text-center">Pago</th>
                <th class="p-3 text-right">Pendiente</th>
                <th class="p-3 text-center">Estado</th>
                <th class="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="gasto in gastosPresupuestados" :key="gasto.id" class="border-t hover:bg-gray-50">
                <td class="p-3">
                  <div class="font-medium">{{ gasto.descripcion }}</div>
                  <div class="text-xs text-gray-500">{{ gasto.categoria }}</div>
                </td>
                <td class="p-3 text-right font-semibold">${{ gasto.montoEstimado.toFixed(2) }}</td>
                <td class="p-3 text-center">
                  <input 
                    v-model.number="gasto.enQue" 
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full p-1 text-sm border rounded text-center"
                    placeholder="0.00"
                  />
                </td>
                <td class="p-3 text-right font-semibold" :class="(gasto.montoEstimado - (gasto.enQue || 0)) > 0 ? 'text-red-600' : 'text-green-600'">
                  ${{ (gasto.montoEstimado - (gasto.enQue || 0)).toFixed(2) }}
                </td>
                <td class="p-3 text-center">
                  <span 
                    class="px-2 py-1 rounded text-xs font-medium cursor-pointer"
                    :class="gasto.pagado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                    @click="togglePagado(gasto)"
                  >
                    {{ gasto.pagado ? 'Pagado' : 'Pendiente' }}
                  </span>
                </td>
                <td class="p-3">
                  <div class="flex gap-2 justify-center">
                    <button @click="editarGasto(gasto)" class="text-blue-600 hover:text-blue-800">
                      <Icon icon="mdi:pencil" class="text-lg" />
                    </button>
                    <button @click="eliminarGasto(gasto.id)" class="text-red-600 hover:text-red-800">
                      <Icon icon="mdi:delete" class="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="p-4 text-center text-gray-500">
          No hay gastos presupuestados para esta fecha.
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar gasto -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-800/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-lg w-full max-w-md shadow-xl">
        <div class="border-b px-4 py-3">
          <h2 class="text-lg font-bold">{{ gastoEditando ? 'Editar' : 'Agregar' }} Gasto</h2>
        </div>
        <form @submit.prevent="guardarGasto" class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input 
              v-model="form.descripcion" 
              type="text" 
              required
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Comida, Luz, Transporte..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select 
              v-model="form.categoria" 
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar...</option>
              <option value="Alimentación">Alimentación</option>
              <option value="Servicios">Servicios</option>
              <option value="Transporte">Transporte</option>
              <option value="Entretenimiento">Entretenimiento</option>
              <option value="Salud">Salud</option>
              <option value="Educación">Educación</option>
              <option value="Deudas">Deudas</option>
              <option value="Ahorro">Ahorro</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Monto Estimado</label>
            <input 
              v-model.number="form.montoEstimado" 
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pago (opcional)</label>
            <input 
              v-model.number="form.enQue" 
              type="number"
              step="0.01"
              min="0"
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div class="flex items-center gap-2">
            <input 
              v-model="form.pagado" 
              type="checkbox"
              id="pagado"
              class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label for="pagado" class="text-sm font-medium text-gray-700">¿Ya está pagado?</label>
          </div>
          <div class="flex justify-end gap-2">
            <button 
              type="button"
              @click="cerrarModal"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {{ gastoEditando ? 'Guardar cambios' : 'Agregar' }}
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
import { useRouter } from 'vue-router'
import ActionButtons from '~/components/ActionButtons.vue'
import { useFirestore } from '~/composables/useFirestore'

const router = useRouter()

// Usar Firestore para presupuestos
const { items: presupuestos, loading, addItem, updateItem, deleteItem, fetchItems } = useFirestore('presupuestos')

const showModal = ref(false)
const gastoEditando = ref(null)
const fechaPresupuesto = ref(new Date().toISOString().split('T')[0])

const form = ref({
  descripcion: '',
  categoria: '',
  montoEstimado: '',
  enQue: 0,
  pagado: false
})

// Cargar presupuestos al montar
onMounted(async () => {
  await fetchItems()
})

const gastosPresupuestados = computed(() => {
  return presupuestos.value.filter(p => p.fecha === fechaPresupuesto.value)
})

const totalEstimado = computed(() => {
  return gastosPresupuestados.value.reduce((sum, g) => sum + g.montoEstimado, 0)
})

const totalPagado = computed(() => {
  return gastosPresupuestados.value
    .filter(g => g.pagado)
    .reduce((sum, g) => sum + g.montoEstimado, 0)
})

const restante = computed(() => {
  return totalEstimado.value - totalPagado.value
})

function goHome() {
  router.push('/')
}

async function cargarPresupuesto() {
  await fetchItems()
}

async function guardarGasto() {
  let result
  
  if (gastoEditando.value) {
    result = await updateItem(gastoEditando.value.id, {
      descripcion: form.value.descripcion,
      categoria: form.value.categoria,
      montoEstimado: form.value.montoEstimado,
      enQue: form.value.enQue,
      pagado: form.value.pagado
    })
  } else {
    result = await addItem({
      ...form.value,
      fecha: fechaPresupuesto.value
    })
  }
  
  if (result.success) {
    cerrarModal()
  } else {
    alert('Error al guardar: ' + result.error)
  }
}

function editarGasto(gasto) {
  gastoEditando.value = gasto
  form.value = {
    descripcion: gasto.descripcion,
    categoria: gasto.categoria,
    montoEstimado: gasto.montoEstimado,
    enQue: gasto.enQue || 0,
    pagado: gasto.pagado
  }
  showModal.value = true
}

async function eliminarGasto(id) {
  if (confirm('¿Estás seguro de eliminar este gasto?')) {
    const result = await deleteItem(id)
    if (!result.success) {
      alert('Error al eliminar: ' + result.error)
    }
  }
}

async function togglePagado(gasto) {
  const result = await updateItem(gasto.id, {
    pagado: !gasto.pagado
  })
  if (!result.success) {
    alert('Error al actualizar: ' + result.error)
  }
}

function cerrarModal() {
  showModal.value = false
  gastoEditando.value = null
  form.value = {
    descripcion: '',
    categoria: '',
    montoEstimado: '',
    enQue: 0,
    pagado: false
  }
}

function guardarCambios() {
  alert('Los cambios se guardan automáticamente en la nube')
}
</script>
