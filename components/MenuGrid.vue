<template>
  <div class="grid grid-cols-2 gap-4 h-full min-h-[60vh] items-stretch">
    <MenuCard
      title="Ingresos"
      icon="mdi:cash-plus"
      color="bg-green-400"
    />
     <MenuCard
      title="Gastos"
      icon="mdi:cash-minus"
      color="bg-red-400"
    />
    <MenuCard
      title="Ahorros / Inversiones"
      icon="mdi:bank"
      color="bg-yellow-400"
    />
    <MenuCard
      title="Deudores"
      icon="mdi:account-cash"
      color="bg-purple-400"
    />
    <MenuCard
      title="Presupuesto"
      icon="mdi:calculator"
      color="bg-blue-400"
    />
    <MenuCard
      title="Estadísticas"
      icon="mdi:chart-bar"
      color="bg-teal-400"
    />
  </div>
</template>

<script setup>
import MenuCard from '~/components/MenuCard.vue'
</script>
