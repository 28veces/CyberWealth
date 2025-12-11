<template>
  <div class="flex flex-col min-h-screen w-full overflow-y-auto">
    <div class="w-full max-w-2xl mx-auto px-4 py-4">
      <div class="flex justify-between items-center mb-4">
        <button @click="goBack" class="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
          <Icon icon="mdi:arrow-left" class="text-3xl text-blue-700" />
        </button>
      </div>

      <template v-if="deuda">
        <h1 class="text-2xl font-bold mb-4">{{ deuda.nombre }}</h1>
        <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Información general -->
          <div class="bg-white p-4 rounded-lg shadow">
            <h2 class="font-semibold mb-3">Información General</h2>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Entidad:</span>
                <span class="font-medium">{{ deuda.entidad }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Monto Total:</span>
                <span class="font-medium">${{ deuda.montoTotal }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Cuota Mensual:</span>
                <span class="font-medium">${{ deuda.cuotaMensual }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Plazo:</span>
                <span class="font-medium">{{ deuda.plazoMeses }} meses</span>
              </div>
            </div>
          </div>

          <!-- Balance actual -->
          <div class="bg-white p-4 rounded-lg shadow">
            <h2 class="font-semibold mb-3">Balance Actual</h2>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Monto Pagado:</span>
                <span class="font-medium text-green-600">${{ montoPagado }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Saldo Pendiente:</span>
                <span class="font-medium text-red-600">${{ saldoPendiente }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Pagos Realizados:</span>
                <span class="font-medium">{{ deuda.pagosRealizados }} de {{ deuda.plazoMeses }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  class="bg-blue-600 h-2.5 rounded-full" 
                  :style="{ width: progreso + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario de aportación -->
        <form @submit.prevent="registrarPago" class="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 class="font-semibold mb-3">Registrar Pago</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm mb-1">Monto</label>
              <input 
                v-model.number="formPago.monto" 
                type="number" 
                min="0" 
                step="0.01" 
                class="w-full border rounded px-2 py-1" 
                required 
              />
            </div>
            <div>
              <label class="block text-sm mb-1">Fecha</label>
              <input 
                v-model="formPago.fecha" 
                type="date" 
                class="w-full border rounded px-2 py-1" 
                required 
              />
            </div>
          </div>
          <div class="flex justify-end mt-4">
            <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
              Registrar Pago
            </button>
          </div>
        </form>

        <!-- Historial de pagos -->
        <div class="bg-white rounded-lg shadow">
          <h2 class="font-semibold p-4 border-b">Historial de Pagos</h2>
          <div class="overflow-x-auto">
            <table v-if="deuda.historialPagos?.length" class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50">
                  <th class="p-2 text-left">Fecha</th>
                  <th class="p-2 text-right">Monto</th>
                  <th class="p-2 text-right">Saldo Restante</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pago, idx) in paginatedHistorial" :key="idx" class="border-t">
                  <td class="p-2">{{ formatearFecha(pago.fecha) }}</td>
                  <td class="p-2 text-right">${{ pago.monto }}</td>
                  <td class="p-2 text-right">${{ pago.saldoRestante }}</td>
                </tr>
              </tbody>
            </table>
            <!-- Paginación -->
            <div v-if="totalPages > 1" class="flex justify-center gap-2 p-4 border-t">
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
            <div v-else-if="!deuda.historialPagos?.length" class="p-4 text-center text-gray-500">
              No hay pagos registrados.
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="text-red-600 font-bold text-lg">Deuda no encontrada.</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const id = Number(route.params.id)

// Estado
const deudas = ref(JSON.parse(localStorage.getItem('deudas') || '[]'))
const deuda = computed(() => deudas.value[id])
const formPago = ref({ monto: '', fecha: '' })

// Paginación
const currentPage = ref(1)
const itemsPerPage = 10

const paginatedHistorial = computed(() => {
  if (!deuda.value?.historialPagos) return []
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return deuda.value.historialPagos.slice(start, end)
})

const totalPages = computed(() => {
  if (!deuda.value?.historialPagos) return 0
  return Math.ceil(deuda.value.historialPagos.length / itemsPerPage)
})

// Cálculos
const montoPagado = computed(() => {
  if (!deuda.value?.historialPagos) return 0
  return deuda.value.historialPagos.reduce((sum, pago) => sum + pago.monto, 0).toFixed(2)
})

const saldoPendiente = computed(() => {
  if (!deuda.value) return 0
  return (deuda.value.montoTotal - parseFloat(montoPagado.value)).toFixed(2)
})

const progreso = computed(() => {
  if (!deuda.value) return 0
  const porcentaje = (parseFloat(montoPagado.value) / deuda.value.montoTotal) * 100
  return Math.min(Math.round(porcentaje), 100)
})

// Funciones
function goBack() {
  router.push('/deudas-largo-plazo')
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString()
}

function registrarPago() {
  if (!deuda.value) return

  // Inicializar el array de historial si no existe
  if (!deuda.value.historialPagos) {
    deuda.value.historialPagos = []
  }

  // Calcular el nuevo saldo restante
  const saldoRestante = deuda.value.montoTotal - 
    (deuda.value.historialPagos.reduce((sum, pago) => sum + pago.monto, 0) + formPago.value.monto)

  // Agregar el nuevo pago al historial
  deuda.value.historialPagos.push({
    fecha: formPago.value.fecha,
    monto: formPago.value.monto,
    saldoRestante
  })

  // Actualizar el contador de pagos realizados
  deuda.value.pagosRealizados = Math.min(
    Math.ceil(parseFloat(montoPagado.value) / deuda.value.cuotaMensual),
    deuda.value.plazoMeses
  )

  // Guardar en localStorage
  localStorage.setItem('deudas', JSON.stringify(deudas.value))

  // Limpiar el formulario
  formPago.value = { monto: '', fecha: '' }
}
</script>
