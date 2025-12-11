<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <AppHeader />
    <main class="flex-1 w-full max-w-md mx-auto p-4">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '~/components/AppHeader.vue'
import AppFooter from '~/components/AppFooter.vue'
</script>

<style>
/* Puedes agregar estilos globales aquí si lo necesitas */
</style>
