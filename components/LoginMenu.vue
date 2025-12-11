<template>
  <div class="relative flex items-center">
    <button @click="toggleMenu" class="p-2 rounded-full bg-transparent hover:bg-white/20 transition-colors">
      <Icon icon="mdi:account-circle" class="text-[2.6rem] text-white" />
    </button>
    <div v-if="showMenu" class="absolute right-0 mt-3 w-44 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
      <button v-if="!isLogged" @click="goLogin" class="w-full px-4 py-2 text-left hover:bg-green-100 text-green-700">Iniciar sesión</button>
      <button v-if="!isLogged" @click="goRegister" class="w-full px-4 py-2 text-left hover:bg-green-100 text-green-700">Registrarse</button>
      <button v-if="isLogged" @click="handleLogout" class="w-full px-4 py-2 text-left hover:bg-green-100 text-green-700">Cerrar sesión</button>
    </div>
    <div v-if="isLogged" class="ml-2 text-white font-semibold text-sm truncate max-w-[100px]">{{ username }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuth } from '~/composables/useAuth.js'
import { useRouter } from 'vue-router'

const showMenu = ref(false)
const { isLogged, username, logout } = useAuth()
const router = useRouter()

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function goLogin() {
  showMenu.value = false
  router.push('/login')
}

function goRegister() {
  showMenu.value = false
  router.push('/login')
}

function handleLogout() {
  logout()
  showMenu.value = false
  router.replace('/login')
}
</script>

<style scoped>
button:focus { outline: none; }
</style>
