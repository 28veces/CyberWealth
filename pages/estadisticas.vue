<template>
  <div class="flex flex-col p-4 min-h-screen bg-gray-50">
    <div class="flex justify-center mb-2">
      <ActionButtons
        :showBack="true"
        :showFilter="true"
        :showSave="true"
        @back="goHome"
        @filter="onFilter"
        @save="onSave"
      />
    </div>
    <h1 class="text-2xl font-bold text-center mb-4">Estadísticas</h1>

    <!-- Resumen General -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">Balance General</h2>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Ingresos Totales:</span>
            <span class="font-medium text-green-600">{{ formatCurrency(balanceGeneral.ingresos) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Gastos Totales:</span>
            <span class="font-medium text-red-600">{{ formatCurrency(balanceGeneral.gastos) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Ahorros:</span>
            <span class="font-medium text-blue-600">{{ formatCurrency(balanceGeneral.ahorros) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Inversiones:</span>
            <span class="font-medium text-purple-600">{{ formatCurrency(balanceGeneral.inversiones) }}</span>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">Obligaciones</h2>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Deudas a Largo Plazo:</span>
            <span class="font-medium text-red-600">{{ formatCurrency(obligaciones.deudasLargoPlazo) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Gastos Fijos Mensuales:</span>
            <span class="font-medium">{{ formatCurrency(obligaciones.gastosFijos) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Por Cobrar:</span>
            <span class="font-medium text-green-600">{{ formatCurrency(obligaciones.porCobrar) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white p-4 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">Distribución de Gastos</h2>
        <div class="h-64">
          <Pie v-if="gastosChartData" :data="gastosChartData" :options="gastosChartOptions" />
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">Tendencia de Ahorro</h2>
        <div class="h-64">
          <Line v-if="ahorrosChartData" :data="ahorrosChartData" :options="ahorrosChartOptions" />
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-md col-span-1 md:col-span-2">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">Estado de Inversiones</h2>
        <div class="h-64">
          <Bar v-if="inversionesChartData" :data="inversionesChartData" :options="inversionesChartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie } from 'vue-chartjs'
import ActionButtons from '~/components/ActionButtons.vue'
import { useFirestore } from '~/composables/useFirestore'

// Registrar todos los plugins necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Cargar datos desde Firestore
const { items: ingresos, fetchItems: fetchIngresos } = useFirestore('ingresos')
const { items: gastos, fetchItems: fetchGastos } = useFirestore('gastos')
const { items: ahorros, fetchItems: fetchAhorros } = useFirestore('ahorros')
const { items: inversiones, fetchItems: fetchInversiones } = useFirestore('inversiones')
const { items: deudas, fetchItems: fetchDeudas } = useFirestore('deudas')
const { items: deudores, fetchItems: fetchDeudores } = useFirestore('deudores')

// Datos ficticios para demostración
const mockData = {
  ingresos: [
    { monto: 4500000, concepto: 'Salario' },
    { monto: 800000, concepto: 'Freelance' }
  ],
  gastos: [
    { categoria: 'Alimentación', montoReal: 800000, tipo: 'fijo' },
    { categoria: 'Transporte', montoReal: 300000, tipo: 'fijo' },
    { categoria: 'Servicios', montoReal: 450000, tipo: 'fijo' },
    { categoria: 'Entretenimiento', montoReal: 400000, tipo: 'variable' },
    { categoria: 'Otros', montoReal: 250000, tipo: 'variable' }
  ],
  cuentas: [
    { 
      tipo: 'ahorro', 
      nombre: 'Ahorro emergencias', 
      saldo: 5000000,
      movimientos: [
        { fecha: '2025-01-15', monto: 800000 },
        { fecha: '2025-02-15', monto: 900000 },
        { fecha: '2025-03-15', monto: 850000 },
        { fecha: '2025-04-15', monto: 1000000 },
        { fecha: '2025-05-15', monto: 750000 },
        { fecha: '2025-06-15', monto: 900000 }
      ]
    },
    { 
      tipo: 'inversion',
      nombre: 'Acciones Tech',
      saldo: 8000000
    },
    { 
      tipo: 'inversion',
      nombre: 'Crypto',
      saldo: 3000000
    },
    { 
      tipo: 'inversion',
      nombre: 'Bonos',
      saldo: 5000000
    }
  ],
  deudas: [
    { montoRestante: 15000000, concepto: 'Hipoteca' },
    { montoRestante: 8000000, concepto: 'Carro' }
  ],
  deudores: [
    { montoRestante: 1200000, nombre: 'Carlos' },
    { montoRestante: 800000, nombre: 'María' }
  ]
}

// Registro de componentes Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const router = useRouter()

// Estados
const balanceGeneral = ref({
  ingresos: 0,
  gastos: 0,
  ahorros: 0,
  inversiones: 0
})

const obligaciones = ref({
  deudasLargoPlazo: 0,
  gastosFijos: 0,
  porCobrar: 0
})

// Datos de los gráficos con estructura inicial válida
const gastosChartData = ref({
  labels: ['Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 'Otros'],
  datasets: [{
    label: 'Gastos por Categoría',
    data: [0, 0, 0, 0, 0],
    backgroundColor: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)'
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)'
    ],
    borderWidth: 1
  }]
})

const ahorrosChartData = ref({
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [{
    label: 'Ahorro Mensual',
    data: [0, 0, 0, 0, 0, 0],
    borderColor: 'rgba(54, 162, 235, 1)',
    backgroundColor: 'rgba(54, 162, 235, 0.2)',
    fill: true,
    tension: 0.1
  }]
})

const inversionesChartData = ref({
  labels: ['Sin datos'],
  datasets: [{
    label: 'Monto Invertido',
    data: [0],
    backgroundColor: 'rgba(75, 192, 192, 0.8)',
    borderColor: 'rgba(75, 192, 192, 1)',
    borderWidth: 1
  }]
})

// Opciones de los gráficos
const gastosChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    },
    title: {
      display: false
    }
  }
}

const ahorrosChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => formatCurrency(value)
      }
    }
  }
}

const inversionesChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => formatCurrency(value)
      }
    }
  }
}

// Funciones principales
function goHome() {
  router.push('/')
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}

// Función para actualizar datos de gráficos de forma segura
function updateChartData(chartRef, newData) {
  if (chartRef.value && newData) {
    chartRef.value = {
      labels: newData.labels,
      datasets: newData.datasets.map(dataset => ({
        ...dataset,
        data: dataset.data || []
      }))
    }
  }
}

// Funciones de carga de datos
function loadBalanceGeneral() {
  try {
    // Cargar desde Firestore
    balanceGeneral.value.ingresos = ingresos.value
      .filter(i => i.active !== false)
      .reduce((sum, i) => sum + (i.amount || 0), 0)
    
    balanceGeneral.value.gastos = gastos.value
      .reduce((sum, g) => sum + (g.montoReal || g.monto || 0), 0)
    
    balanceGeneral.value.ahorros = ahorros.value
      .reduce((sum, c) => sum + (c.balance || 0), 0)
    
    balanceGeneral.value.inversiones = inversiones.value
      .reduce((sum, c) => sum + (c.balance || 0), 0)
  } catch (error) {
    console.error('Error al cargar el balance general:', error)
  }
}

function loadObligaciones() {
  try {
    // Calcular deudas pendientes
    obligaciones.value.deudasLargoPlazo = deudas.value
      .reduce((sum, d) => {
        const montoPagado = (d.cuotaMensual || 0) * (d.pagosRealizados || 0)
        return sum + ((d.montoTotal || 0) - montoPagado)
      }, 0)
    
    // Gastos fijos mensuales
    obligaciones.value.gastosFijos = gastos.value
      .filter(g => g.tipo === 'fijo')
      .reduce((sum, g) => sum + (g.montoReal || g.monto || 0), 0)
    
    // Por cobrar de deudores
    obligaciones.value.porCobrar = deudores.value
      .filter(d => !d.pagado)
      .reduce((sum, d) => {
        const totalPagado = (d.pagos || []).reduce((s, p) => s + (p.monto || 0), 0)
        return sum + ((d.monto || 0) - totalPagado)
      }, 0)
  } catch (error) {
    console.error('Error al cargar las obligaciones:', error)
  }
}

function loadGastosChart() {
  try {
    const categorias = {}
    
    // Agrupar gastos por categoría desde Firestore
    gastos.value.forEach(gasto => {
      const cat = gasto.categoria || 'Otros'
      if (!categorias[cat]) {
        categorias[cat] = 0
      }
      categorias[cat] += (gasto.montoReal || gasto.monto || 0)
    })

    const labels = Object.keys(categorias)
    const data = Object.values(categorias)
    
    // Si no hay datos, mostrar mensaje
    if (labels.length === 0) {
      labels.push('Sin datos')
      data.push(0)
    }

    updateChartData(gastosChartData, {
      labels,
      datasets: [{
        label: 'Gastos por Categoría',
        data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(201, 203, 207, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 1
      }]
    })
  } catch (error) {
    console.error('Error al cargar el gráfico de gastos:', error)
  }
}

function loadAhorrosChart() {
  try {
    // Obtener los últimos 6 meses de ahorros
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
    const data = new Array(6).fill(0)
    
    // Si hay cuentas de ahorro con historial, usar esos datos
    if (ahorros.value.length > 0) {
      const cuenta = ahorros.value[0]
      if (cuenta.history && Array.isArray(cuenta.history)) {
        cuenta.history.slice(-6).forEach((mov, index) => {
          data[index] = mov.monto || 0
        })
      } else {
        // Si no hay historial, mostrar el balance actual
        data[5] = cuenta.balance || 0
      }
    }

    updateChartData(ahorrosChartData, {
      labels,
      datasets: [{
        label: 'Ahorro Mensual',
        data,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.1
      }]
    })
  } catch (error) {
    console.error('Error al cargar el gráfico de ahorros:', error)
  }
}

function loadInversionesChart() {
  try {
    // Cargar desde Firestore
    const labels = inversiones.value.map(i => i.name || 'Sin nombre')
    const data = inversiones.value.map(i => i.balance || 0)
    
    // Si no hay inversiones, mostrar placeholder
    if (labels.length === 0) {
      labels.push('Sin inversiones')
      data.push(0)
    }

    updateChartData(inversionesChartData, {
      labels,
      datasets: [{
        label: 'Monto Invertido',
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    })
  } catch (error) {
    console.error('Error al cargar el gráfico de inversiones:', error)
  }
}

// Función para cargar todos los datos
async function loadAllData() {
  try {
    // Cargar todos los datos desde Firestore
    await Promise.all([
      fetchIngresos(),
      fetchGastos(),
      fetchAhorros(),
      fetchInversiones(),
      fetchDeudas(),
      fetchDeudores()
    ])
    
    // Actualizar gráficos y estadísticas
    loadBalanceGeneral()
    loadObligaciones()
    loadGastosChart()
    loadAhorrosChart()
    loadInversionesChart()
  } catch (error) {
    console.error('Error al cargar todos los datos:', error)
  }
}

// Cargar datos al montar el componente
onMounted(async () => {
  await loadAllData()
})

// Funciones de los botones de acción
function onFilter() {
  // Aquí puedes abrir un modal o mostrar opciones de filtro para estadísticas
  alert('Funcionalidad de filtro próximamente')
}

function onSave() {
  // Aquí puedes implementar la lógica para exportar o guardar el resumen de estadísticas
  alert('Funcionalidad de guardar próximamente')
}
</script>
