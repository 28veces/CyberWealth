<template>
  <div class="flex flex-col min-h-screen w-full overflow-y-auto" :class="{ 'overflow-hidden': showModal || showModalPago }">
    <div class="w-full max-w-2xl mx-auto px-4 py-4">
      <div class="flex justify-center mb-2">
        <ActionButtons 
          @back="goHome"
          @filter="toggleFiltros"
          @save="guardarCambios"
        />
      </div>
      <h1 class="text-2xl font-bold text-center mb-4">Deudores</h1>

      <!-- Filtros -->
      <div v-if="mostrarFiltros" class="bg-white p-4 rounded-lg shadow mb-4">
        <h3 class="font-semibold mb-2">Filtros</h3>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="estado in ['Todos', 'Pendientes', 'Pagados', 'Mayor monto']" 
            :key="estado"
            @click="filtrarPor(estado)"
            class="px-3 py-1 rounded-full text-sm"
            :class="filtroActual === estado ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'"
          >
            {{ estado }}
          </button>
        </div>
      </div>

      <!-- Total adeudado -->
      <div class="bg-red-50 p-4 rounded-lg shadow mb-6">
        <div class="flex justify-between items-center">
          <h2 class="font-semibold">Total por cobrar:</h2>
          <span class="text-2xl font-bold text-red-600">
            ${{ totalDeudas.toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Botón agregar deudor -->
      <button @click="showModal = true" class="mb-6 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors">
        <Icon icon="mdi:plus" class="text-xl" />
        Registrar Préstamo
      </button>

      <!-- Lista de deudores -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <h2 class="font-semibold p-4 border-b">Listado de Préstamos</h2>
        <div v-if="deudoresFiltrados.length">
          <div v-for="deudor in deudoresFiltrados" :key="deudor.id" class="border-b last:border-b-0">
            <div class="p-4">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-medium">{{ deudor.nombre }}</h3>
                  <p class="text-sm text-gray-600">{{ deudor.descripcion }}</p>
                  <p class="text-xs text-gray-500">Fecha: {{ deudor.fecha }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold" :class="deudor.pagado ? 'text-green-600' : 'text-red-600'">
                    ${{ (deudor.monto - deudor.pagos.filter(p => p.tipoPago === 'capital').reduce((sum, p) => sum + p.monto, 0)).toFixed(2) }}
                  </p>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-1 rounded-full text-xs" 
                    :class="deudor.pagado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                    {{ deudor.pagado ? 'Pagado' : 'Pendiente' }}
                  </span>
                  <span v-if="!deudor.pagado && deudor.fechaLimite" 
                    :class="estaVencido(deudor.fechaLimite) ? 'text-red-600' : 'text-gray-600'"
                    class="text-xs">
                    {{ estaVencido(deudor.fechaLimite) ? 'Vencido' : `Vence: ${formatearFecha(deudor.fechaLimite)}` }}
                  </span>
                </div>
                <div class="flex gap-2">
                  <button @click="registrarPago(deudor)" 
                    class="text-blue-600 hover:text-blue-800 p-1"
                    :disabled="false">
                    <Icon icon="mdi:cash-plus" class="text-xl" />
                  </button>                  
                  <button @click="verHistorialPagos(deudor)" class="text-green-600 hover:text-green-800 p-1">
                    <Icon icon="mdi:clipboard-list-outline" class="text-xl" />
                  </button>
                  <button @click="editarDeudor(deudor)" class="text-blue-600 hover:text-blue-800 p-1">
                    <Icon icon="mdi:pencil" class="text-xl" />
                  </button>
                  <button @click="eliminarDeudor(deudor.id)" class="text-red-600 hover:text-red-800 p-1">
                    <Icon icon="mdi:delete" class="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="p-4 text-center text-gray-500">
          No hay préstamos registrados.
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar deudor -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-800/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-lg w-full max-w-md shadow-xl">
        <div class="border-b px-4 py-3">
          <h2 class="text-lg font-bold">{{ deudorEditando ? 'Editar' : 'Registrar' }} Préstamo</h2>
        </div>
        <form @submit.prevent="guardarDeudor" class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del deudor</label>
            <input 
              v-model="form.nombre" 
              type="text" 
              required
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input 
              v-model="form.descripcion" 
              type="text"
              required
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input 
              v-model.number="form.monto" 
              type="number"
              step="0.01"
              required
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha del préstamo</label>
            <input 
              v-model="form.fecha" 
              type="date"
              required
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha límite (opcional)</label>
            <input 
              v-model="form.fechaLimite" 
              type="date"
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de deudor</label>
            <select v-model="form.tipo" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
              <option value="compra">Compra de producto</option>
              <option value="prestamo_sin_interes">Préstamo sin interés</option>
              <option value="prestamo_con_interes">Préstamo con interés</option>
            </select>
          </div>
          <div v-if="form.tipo === 'prestamo_con_interes'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Porcentaje de interés</label>
            <input v-model.number="form.porcentajeInteres" type="number" step="0.01" min="0" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
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
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              {{ deudorEditando ? 'Guardar cambios' : 'Registrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para registrar pago -->
    <div v-if="showModalPago" class="fixed inset-0 bg-gray-800/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-lg w-full max-w-md shadow-xl">
        <div class="border-b px-4 py-3">
          <h2 class="text-lg font-bold">Registrar Pago</h2>
        </div>
        <form @submit.prevent="guardarPago" class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Monto del pago</label>
            <input 
              v-model.number="formPago.monto" 
              type="number"
              step="0.01"
              required
              :max="deudorSeleccionado ? deudorSeleccionado.monto - deudorSeleccionado.pagos.filter(p => p.tipoPago === 'capital').reduce((sum, p) => sum + p.monto, 0) : 0"
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha del pago</label>
            <input 
              v-model="formPago.fecha" 
              type="date"
              required
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div v-if="deudorSeleccionado && deudorSeleccionado.tipo === 'prestamo_con_interes'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de pago</label>
            <select v-model="formPago.tipoPago" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="capital">Capital</option>
              <option value="interes">Interés</option>
            </select>
          </div>
          <div class="flex justify-end gap-2">
            <button 
              type="button"
              @click="showModalPago = false"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Registrar pago
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para historial de pagos -->
    <div v-if="showModalHistorial" class="fixed inset-0 bg-gray-800/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-lg w-full max-w-md shadow-xl">
        <div class="border-b px-4 py-3">
          <h2 class="text-lg font-bold">Historial de Pagos</h2>
        </div>
        <div class="p-4 space-y-4">
          <div v-if="deudorSeleccionado && deudorSeleccionado.pagos.length > 0">
            <h3 class="font-medium mb-3">{{ deudorSeleccionado.nombre }}</h3>
            <ul class="space-y-2">
              <li v-for="pago in deudorSeleccionado.pagos" :key="pago.id" class="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <span class="font-semibold">${{ pago.monto.toFixed(2) }}</span>
                  <span class="mx-2">•</span>
                  <span class="text-sm text-gray-600">{{ formatearFecha(pago.fecha) }}</span>
                </div>
                <span 
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="pago.tipoPago === 'capital' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'"
                >
                  {{ pago.tipoPago === 'capital' ? 'Capital' : 'Interés' }}
                </span>
              </li>
            </ul>
          </div>
          <div v-else class="text-center text-gray-500">
            No hay pagos registrados.
          </div>
          <div class="flex justify-end">
            <button @click="showModalHistorial = false" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Cerrar
            </button>
          </div>
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

// Usar Firestore para deudores
const { items: deudores, loading, addItem, updateItem, deleteItem, fetchItems } = useFirestore('deudores')

const showModal = ref(false)
const showModalPago = ref(false)
const mostrarFiltros = ref(false)
const filtroActual = ref('Todos')
const deudorEditando = ref(null)
const deudorSeleccionado = ref(null)
const showModalHistorial = ref(false)

const form = ref({
  nombre: '',
  descripcion: '',
  monto: '',
  fecha: new Date().toISOString().split('T')[0],
  fechaLimite: '',
  tipo: 'compra',
  porcentajeInteres: 0,
  pagos: []
})

const formPago = ref({
  monto: '',
  fecha: new Date().toISOString().split('T')[0],
  tipoPago: 'capital'
})

// Cargar datos al montar
onMounted(async () => {
  await fetchItems()
})

// Cálculos y filtros
const deudoresFiltrados = computed(() => {
  let items = [...deudores.value]
  switch (filtroActual.value) {
    case 'Pendientes':
      return items.filter(d => !d.pagado)
    case 'Pagados':
      return items.filter(d => d.pagado)
    case 'Mayor monto':
      return items.sort((a, b) => {
        const saldoA = a.monto - a.pagos.reduce((sum, p) => sum + p.monto, 0)
        const saldoB = b.monto - b.pagos.reduce((sum, p) => sum + p.monto, 0)
        return saldoB - saldoA
      })
    default:
      return items
  }
})

const totalDeudas = computed(() => {
  return deudores.value.reduce((total, deudor) => {
    if (!deudor.pagado) {
      const pagado = deudor.pagos
        .filter((pago) => pago.tipoPago === "capital")
        .reduce((sum, pago) => sum + pago.monto, 0);
      return total + (deudor.monto - pagado);
    }
    return total;
  }, 0);
})

// Funciones de navegación y filtrado
function goHome() {
  router.push('/')
}

function toggleFiltros() {
  mostrarFiltros.value = !mostrarFiltros.value
}

function filtrarPor(filtro) {
  filtroActual.value = filtro
}

// Funciones para el manejo de deudores
async function guardarDeudor() {
  let result
  
  if (deudorEditando.value) {
    result = await updateItem(deudorEditando.value.id, {
      nombre: form.value.nombre,
      descripcion: form.value.descripcion,
      monto: form.value.monto,
      fecha: form.value.fecha,
      fechaLimite: form.value.fechaLimite,
      tipo: form.value.tipo,
      porcentajeInteres: form.value.porcentajeInteres
    })
  } else {
    result = await addItem({
      ...form.value,
      pagado: false,
      pagos: []
    })
  }
  
  if (result.success) {
    cerrarModal()
  } else {
    alert('Error al guardar: ' + result.error)
  }
}

function editarDeudor(deudor) {
  deudorEditando.value = deudor
  form.value = {
    nombre: deudor.nombre,
    descripcion: deudor.descripcion,
    monto: deudor.monto,
    fecha: deudor.fecha,
    fechaLimite: deudor.fechaLimite,
    tipo: deudor.tipo,
    porcentajeInteres: deudor.porcentajeInteres
  }
  showModal.value = true
}

async function eliminarDeudor(id) {
  if (confirm('¿Estás seguro de eliminar este registro?')) {
    const result = await deleteItem(id)
    if (!result.success) {
      alert('Error al eliminar: ' + result.error)
    }
  }
}

function cerrarModal() {
  showModal.value = false
  deudorEditando.value = null
  form.value = {
    nombre: '',
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    fechaLimite: '',
    tipo: 'compra',
    porcentajeInteres: 0,
    pagos: []
  }
}

// Funciones para el manejo de pagos
function registrarPago(deudor) {
  deudorSeleccionado.value = deudor
  formPago.value.monto = 0;
  console.log('Opening payment modal for:', deudorSeleccionado.value);
  console.log('Initial payment form data:', formPago.value);
  console.log('Button clicked for registrarPago:', deudor);
  showModalPago.value = true
}

async function guardarPago() {
  if (!deudorSeleccionado.value) return;

  console.log("Pago registrado:", formPago.value);
  console.log("Deudor antes del pago:", JSON.stringify(deudorSeleccionado.value));

  // Validar que el monto del pago sea mayor a 0
  if (formPago.value.monto <= 0) {
    alert("El monto del pago debe ser mayor a 0.");
    return;
  }

  const nuevosPagos = [
    ...deudorSeleccionado.value.pagos,
    {
      ...formPago.value,
      id: Date.now(),
    },
  ];

  console.log("Pagos después de agregar el nuevo pago:", JSON.stringify(nuevosPagos));

  // Calcular el total pagado solo con pagos de tipo "capital"
  const totalPagado = nuevosPagos
    .filter((p) => p.tipoPago === "capital")
    .reduce((sum, p) => sum + p.monto, 0);

  console.log("Total pagado (solo capital):", totalPagado);

  const pagado = totalPagado >= deudorSeleccionado.value.monto;

  console.log("Monto original de la deuda:", deudorSeleccionado.value.monto);

  const result = await updateItem(deudorSeleccionado.value.id, {
    pagos: nuevosPagos,
    pagado
  });

  console.log("Deudor después del pago:", JSON.stringify({
    pagos: nuevosPagos,
    pagado,
  }));

  if (result.success) {
    showModalPago.value = false;
    deudorSeleccionado.value = null;
    formPago.value = {
      monto: "",
      fecha: new Date().toISOString().split("T")[0],
      tipoPago: "capital",
    };
  } else {
    alert("Error al guardar pago: " + result.error);
  }
}

// Funciones de utilidad
function guardarCambios() {
  // Ya no es necesario, Firestore guarda automáticamente
  alert('Los cambios se guardan automáticamente en la nube')
}

function estaVencido(fecha) {
  if (!fecha) return false
  return new Date(fecha) < new Date()
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString()
}

function verHistorialPagos(deudor) {
  deudorSeleccionado.value = deudor
  showModalHistorial.value = true
}
</script>
