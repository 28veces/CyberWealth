<template>
  <header class="w-full py-4 px-6 bg-green-600 text-white shadow-md flex items-center justify-between relative z-40 overflow-visible">
    <div class="flex items-center gap-2">
      <Icon icon="mdi:shield-home" class="text-2xl text-white mr-1" />
      <h1 class="text-xl font-bold tracking-wide">CyberWealth</h1>
    </div>
    <LoginMenu />
  </header>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import LoginMenu from '~/components/LoginMenu.vue'
</script>
