<template>
  <div :class="['rounded-xl shadow-lg p-4 flex flex-col items-center justify-center min-h-[140px] cursor-pointer transition-transform hover:scale-105', color]" @click="navigate">
    <div class="flex flex-col items-center justify-center flex-1 w-full">
      <Icon v-if="icon" :icon="icon" class="text-5xl mb-2 text-white" />
      <h2 class="text-lg font-semibold text-white text-center">{{ title }}</h2>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  icon: String,
  color: String
})
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const routes = {
  'Ingresos': '/ingresos',
  'Ahorros / Inversiones': '/ahorros-inversiones',
  'Gastos': '/gastos',
  'Presupuesto': '/presupuesto',
  'Deudores': '/deudores',
  'Estadísticas': '/estadisticas'
}

function navigate() {
  if (routes[props.title]) {
    router.push(routes[props.title])
  }
}
</script>
