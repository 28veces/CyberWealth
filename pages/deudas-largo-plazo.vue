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
      <h1 class="text-2xl font-bold text-center mb-4">Deudas a Largo Plazo</h1>

      <!-- Filtros -->
      <div v-if="mostrarFiltros" class="bg-white p-4 rounded-lg shadow mb-4">
        <h3 class="font-semibold mb-2">Filtros</h3>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="estado in ['Todas', 'En progreso', 'Completadas']" 
            :key="estado"
            @click="filtrarPorEstado(estado)"
            class="px-3 py-1 rounded-full text-sm"
            :class="estadoActual === estado ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'"
          >
            {{ estado }}
          </button>
        </div>
      </div>

      <button @click="showModal = true" class="mb-6 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors">
        <Icon icon="mdi:plus" class="text-xl" />
        Registrar Nueva Deuda
      </button>

      <!-- Total de Deudas -->
      <div class="mb-6 p-4 bg-red-50 rounded-lg shadow">
        <div class="flex justify-between items-center">
          <span class="font-semibold text-lg">Total Deudas:</span>
          <span class="text-red-600 text-xl font-bold">${{ totalDeudas }}</span>
        </div>
      </div>

      <!-- Tabla de deudas -->
      <div v-if="deudasFiltradas.length" class="w-full">
        <table class="w-full bg-white rounded shadow text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 text-left">Nombre</th>
              <th class="p-2 text-right">Monto Total</th>
              <th class="p-2 text-right">Cuota Mensual</th>
              <th class="p-2 text-center">Progreso</th>
              <th class="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(deuda, idx) in deudasFiltradas" :key="idx" class="border-t">
              <td class="p-2">
                {{ deuda.nombre }}
                <div class="text-xs text-gray-500">{{ deuda.entidad }}</div>
              </td>
              <td class="p-2 text-right">${{ deuda.montoTotal }}</td>
              <td class="p-2 text-right">${{ deuda.cuotaMensual }}</td>
              <td class="p-2">
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    class="bg-blue-600 h-2.5 rounded-full" 
                    :style="{ width: calcularProgreso(deuda) + '%' }"
                  ></div>
                </div>
                <div class="text-xs text-center mt-1">
                  {{ calcularProgreso(deuda) }}% completado
                </div>
              </td>
              <td class="p-2">
                <button 
                  @click="goToDeuda(idx)" 
                  class="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors mx-auto flex items-center"
                >
                  <Icon icon="mdi:clipboard-text" class="text-xl text-blue-700" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-gray-500 text-center mt-4">
        No hay deudas registradas.
      </div>

      <!-- Modal para nueva deuda -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
          <h2 class="text-lg font-bold mb-4">Registrar Nueva Deuda</h2>
          <form @submit.prevent="agregarDeuda">
            <div class="mb-3">
              <label class="block text-sm mb-1">Nombre de la deuda</label>
              <input v-model="form.nombre" type="text" class="w-full border rounded px-2 py-1" required />
            </div>
            <div class="mb-3">
              <label class="block text-sm mb-1">Entidad financiera</label>
              <input v-model="form.entidad" type="text" class="w-full border rounded px-2 py-1" required />
            </div>
            <div class="mb-3">
              <label class="block text-sm mb-1">Monto total</label>
              <input v-model.number="form.montoTotal" type="number" min="0" step="0.01" class="w-full border rounded px-2 py-1" required />
            </div>
            <div class="mb-3">
              <label class="block text-sm mb-1">Cuota mensual</label>
              <input v-model.number="form.cuotaMensual" type="number" min="0" step="0.01" class="w-full border rounded px-2 py-1" required />
            </div>
            <div class="mb-3">
              <label class="block text-sm mb-1">Fecha inicio</label>
              <input v-model="form.fechaInicio" type="date" class="w-full border rounded px-2 py-1" required />
            </div>
            <div class="mb-4">
              <label class="block text-sm mb-1">Plazo (meses)</label>
              <input v-model.number="form.plazoMeses" type="number" min="1" class="w-full border rounded px-2 py-1" required />
            </div>
            <div class="flex justify-end gap-2">
              <button type="button" @click="closeModal" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
                Cancelar
              </button>
              <button type="submit" class="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">
                Guardar
              </button>
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

const router = useRouter()
const showModal = ref(false)
const deudas = ref([])
const form = ref({
  nombre: '',
  entidad: '',
  montoTotal: '',
  cuotaMensual: '',
  fechaInicio: '',
  plazoMeses: '',
  pagosRealizados: 0
})
const mostrarFiltros = ref(false)
const estadoActual = ref('Todas')

const deudasFiltradas = computed(() => {
  if (estadoActual.value === 'Todas') return deudas.value
  if (estadoActual.value === 'Completadas') {
    return deudas.value.filter(d => calcularProgreso(d) >= 100)
  }
  return deudas.value.filter(d => calcularProgreso(d) < 100)
})

// Cargar deudas desde localStorage
onMounted(() => {
  const storedDeudas = localStorage.getItem('deudas')
  if (storedDeudas) {
    deudas.value = JSON.parse(storedDeudas)
  }
})

function goHome() {
  router.push('/')
}

function agregarDeuda() {
  deudas.value.push({
    ...form.value,
    pagosRealizados: 0,
    fechaUltimoPago: null,
    active: true
  })
  localStorage.setItem('deudas', JSON.stringify(deudas.value))
  closeModal()
  form.value = {
    nombre: '',
    entidad: '',
    montoTotal: '',
    cuotaMensual: '',
    fechaInicio: '',
    plazoMeses: '',
    pagosRealizados: 0
  }
}

function closeModal() {
  showModal.value = false
}

function goToDeuda(idx) {
  router.push(`/deudas/${idx}`)
}

function calcularProgreso(deuda) {
  const progreso = (deuda.pagosRealizados / deuda.plazoMeses) * 100
  return Math.min(Math.round(progreso), 100)
}

const totalDeudas = computed(() => {
  return deudas.value.reduce((sum, deuda) => {
    const montoPagado = deuda.cuotaMensual * deuda.pagosRealizados
    return sum + (deuda.montoTotal - montoPagado)
  }, 0).toFixed(2)
})

function toggleFiltros() {
  mostrarFiltros.value = !mostrarFiltros.value
}

function filtrarPorEstado(estado) {
  estadoActual.value = estado
}

function guardarCambios() {
  localStorage.setItem('deudas', JSON.stringify(deudas.value))
}
</script>
