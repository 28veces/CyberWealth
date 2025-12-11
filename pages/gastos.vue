<template>
  <div class="flex flex-col min-h-screen w-full overflow-y-auto" :class="{ 'overflow-hidden': showModal || showIngresoModal }">
    <div class="w-full max-w-2xl mx-auto px-4 py-4">
      <div class="flex justify-center mb-2">
        <ActionButtons 
          @back="goHome"
          @filter="toggleFiltros"
          @save="guardarCambios"
        />
      </div>
      <h1 class="text-2xl font-bold text-center mb-4">Gastos Quincenales</h1>

      <!-- Filtros -->
      <div v-if="mostrarFiltros" class="bg-white p-4 rounded-lg shadow mb-4">
        <h3 class="font-semibold mb-2">Filtros</h3>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="cat in ['Todos', 'Fijo', 'Variable', 'Ocasional']" 
            :key="cat"
            @click="filtrarPorCategoria(cat)"
            class="px-3 py-1 rounded-full text-sm"
            :class="categoriaActual === cat ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Resumen financiero -->
      <div class="grid gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex justify-between items-center mb-2">
            <h2 class="font-semibold">Ingreso Quincenal</h2>
            <button @click="editarIngreso" class="text-blue-600">
              <i class="fas fa-edit"></i>
            </button>
          </div>
          <p class="text-2xl font-bold text-green-600">${{ ingresoQuincenal.toFixed(2) }}</p>
        </div>

        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="font-semibold mb-2">Deudas Quincenales</h2>
          <p class="text-2xl font-bold text-red-600">${{ totalDeudasQuincenales.toFixed(2) }}</p>
        </div>

        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="font-semibold mb-2">Saldo Disponible (Real)</h2>
          <p class="text-2xl font-bold" :class="saldoDisponible >= 0 ? 'text-green-600' : 'text-red-600'">
            ${{ saldoDisponible.toFixed(2) }}
          </p>
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
        <div class="table-responsive">
          <table v-if="gastosFiltrados.length" class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="p-2 text-left">Concepto</th>
                <th class="p-2 text-right">Monto Total</th>
                <th class="p-2 text-center">Tipo</th>
                <th class="p-2 text-center">Categoría</th>
                <th class="p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(gasto, idx) in gastosFiltrados" :key="gasto.id" class="border-t">
                <td class="p-2">{{ gasto.descripcion }}</td>
                <td class="p-2 text-right">${{ (gasto.montoTotal || 0).toFixed(2) }}</td>
                <td class="p-2 text-center">
                  <span class="px-2 py-1 rounded-full text-xs" :class="gasto.tipo === 'fijo' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'">
                    {{ gasto.tipo === 'fijo' ? 'Fijo' : 'Variable' }}
                  </span>
                </td>
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
            </tbody>
          </table>
          <div v-else class="p-4 text-center text-gray-500">
            No hay gastos registrados.
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar gasto -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-800/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-lg w-full max-w-md shadow-xl">
        <div class="border-b px-4 py-3">
          <h2 class="text-lg font-bold">{{ editandoIdx !== null ? 'Editar' : 'Agregar' }} Gasto</h2>
        </div>
        <form @submit.prevent="guardarGasto" class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input 
              v-model="formGasto.descripcion" 
              type="text" 
              required
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Gasto</label>
            <select 
              v-model="formGasto.tipo" 
              required
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar tipo</option>
              <option value="fijo">Fijo</option>
              <option value="variable">Variable</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select 
              v-model="formGasto.categoria" 
              required
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar categoría</option>
              <option v-for="cat in categoriasPorTipo" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Monto Total</label>
            <input 
              v-model.number="formGasto.montoTotal" 
              type="number" 
              step="0.01"
              required
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
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
    <div v-if="showModalIngreso" class="fixed inset-0 bg-gray-800/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-lg w-full max-w-md shadow-xl">
        <div class="border-b px-4 py-3">
          <h2 class="text-lg font-bold">Editar Ingreso Quincenal</h2>
        </div>
        <form @submit.prevent="guardarIngreso" class="p-4 space-y-4">
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
import { useRouter } from 'vue-router'
import ActionButtons from '~/components/ActionButtons.vue'
import { useFirestore } from '~/composables/useFirestore'

const router = useRouter()

// Usar Firestore para gastos
const { items: gastos, loading, addItem, updateItem, deleteItem, fetchItems } = useFirestore('gastos')
const { items: configuracion, addItem: addConfig, updateItem: updateConfig, fetchItems: fetchConfig } = useFirestore('configuracion')

// Importar y usar Firestore para la colección deudas
const { items: deudas, fetchItems: fetchDeudas } = useFirestore('deudas');

// Importar y usar Firestore para la colección ingresos
const { items: ingresos, fetchItems: fetchIngresos } = useFirestore('ingresos');

// Variables reactivas
const ingresoQuincenal = ref(0)
const showModal = ref(false)
const showModalIngreso = ref(false)
const nuevoIngresoQuincenal = ref(0)
const gastoEditando = ref(null)
const mostrarFiltros = ref(false)
const categoriaActual = ref('Todos')
const formGasto = ref({
  descripcion: '',
  categoria: '',
  tipo: '',
  montoTotal: 0
})

// Declarar la propiedad reactiva showIngresoModal
const showIngresoModal = ref(false);

// Cambiar totalDeudasQuincenales a una propiedad reactiva
const totalDeudasQuincenales = ref(0);

// Declarar la propiedad reactiva editandoIdx
const editandoIdx = ref(null);

const categoriasFijas = [
  'Renta/Hipoteca',
  'Servicios básicos',
  'Transporte',
  'Seguros',
  'Suscripciones',
  'Telefonía/Internet',
  'Préstamos',
  'Educación'
]

const categoriasVariables = [
  'Alimentación',
  'Entretenimiento',
  'Ropa y calzado',
  'Salud',
  'Mantenimiento hogar',
  'Regalos',
  'Viajes',
  'Emergencias',
  'Otros'
]

const categoriasPorTipo = computed(() => {
  if (formGasto.value.tipo === 'fijo') return categoriasFijas
  if (formGasto.value.tipo === 'variable') return categoriasVariables
  return []
})

// Cargar datos cuando el componente se monta en el cliente
onMounted(async () => {
  try {
    await fetchItems();
    await fetchConfig();
    await fetchIngresos();

    console.log('Datos de ingresos:', ingresos.value);

    // Calcular ingreso quincenal considerando la periodicidad
    ingresoQuincenal.value = ingresos.value.reduce((total, ingreso) => {
      const amount = ingreso.amount || 0;
      // Si la periodicidad es "1 mes", dividir entre 2 para obtener el valor quincenal
      if (ingreso.periodicity === '1 mes') {
        return total + (amount / 2);
      }
      return total + amount;
    }, 0);

    // Calcular deudas quincenales como suma de gastos quincenales (usando montoTotal)
    totalDeudasQuincenales.value = gastos.value.reduce((total, gasto) => total + (gasto.montoTotal || 0), 0);
  } catch (error) {
    console.error('Error al cargar datos desde Firestore:', error);
  }
})

// Cálculo del total de gastos estimados y reales
const totalGastos = computed(() => ({
  estimado: gastos.value.reduce((total, gasto) => total + gasto.monto, 0),
  real: gastos.value.reduce((total, gasto) => total + gasto.montoReal, 0)
}))

// Calcular saldo disponible como computed property
const saldoDisponible = computed(() => {
  return (ingresoQuincenal.value || 0) - (totalDeudasQuincenales.value || 0);
});

// Validar valores numéricos en los cálculos
function recalcularSaldoDisponible() {
  const totalGastos = gastos.value.reduce((total, gasto) => total + (gasto.montoTotal || 0), 0);
  totalDeudasQuincenales.value = totalGastos;
}

const gastosFiltrados = computed(() => {
  if (categoriaActual.value === 'Todos') return gastos.value
  return gastos.value.filter(g => g.categoria === categoriaActual.value)
})

function goHome() {
  router.push('/')
}

// Función para obtener el estilo de la categoría
function getCategoriaClase(categoria) {
  if (categoriasFijas.includes(categoria)) {
    return 'bg-blue-100 text-blue-800'
  }
  return 'bg-yellow-100 text-yellow-800'
}

// Declarar guardarGasto como async
async function guardarGasto() {
  let result;
  if (editandoIdx.value !== null) {
    // Editar gasto existente
    result = await updateItem(gastoEditando.value.id, formGasto.value);
    editandoIdx.value = null;
  } else {
    // Agregar nuevo gasto
    result = await addItem(formGasto.value);
  }

  if (result.success) {
    // Recalcular saldo disponible
    recalcularSaldoDisponible();

    // Cerrar modal
    showModal.value = false;
  } else {
    console.error('Error al guardar gasto:', result.error);
  }
}

function editarGasto(idx) {
  gastoEditando.value = gastos.value[idx]
  formGasto.value = { ...gastos.value[idx] }
  showModal.value = true
}

async function eliminarGasto(idx) {
  if (confirm('¿Estás seguro de eliminar este gasto?')) {
    const gasto = gastos.value[idx]
    const result = await deleteItem(gasto.id)
    if (!result.success) {
      alert('Error al eliminar: ' + result.error)
    } else {
      // Recalcular saldo disponible después de eliminar
      recalcularSaldoDisponible();
    }
  }
}

function closeModal() {
  showModal.value = false
  gastoEditando.value = null
  formGasto.value = {
    descripcion: '',
    categoria: '',
    tipo: '',
    montoTotal: 0
  }
}

async function guardarIngreso() {
  ingresoQuincenal.value = nuevoIngresoQuincenal.value
  
  // Buscar si ya existe la configuración
  const ingresoConfig = configuracion.value.find(c => c.tipo === 'ingresoQuincenal')
  
  let result
  if (ingresoConfig) {
    result = await updateConfig(ingresoConfig.id, { 
      tipo: 'ingresoQuincenal', 
      valor: nuevoIngresoQuincenal.value 
    })
  } else {
    result = await addConfig({ 
      tipo: 'ingresoQuincenal', 
      valor: nuevoIngresoQuincenal.value 
    })
  }
  
  if (result.success) {
    showModalIngreso.value = false
    // Recalcular saldo disponible después de actualizar el ingreso
    recalcularSaldoDisponible();
  } else {
    alert('Error al guardar ingreso: ' + result.error)
  }
}

function toggleFiltros() {
  mostrarFiltros.value = !mostrarFiltros.value
}

function filtrarPorCategoria(categoria) {
  categoriaActual.value = categoria
}

function guardarCambios() {
  // Ya no es necesario, Firestore guarda automáticamente
  alert('Los cambios se guardan automáticamente en la nube')
}
</script>

<style scoped>
  table {
    table-layout: auto;
    width: 100%;
  }

  th, td {
    word-wrap: break-word;
    white-space: normal;
  }

  .table-responsive {
    overflow-x: auto;
  }
</style>
