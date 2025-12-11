<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-400 via-green-200 to-blue-200">
    <div class="bg-white/90 rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center animate-fade-in">
      <Icon icon="mdi:shield-home" class="text-5xl text-green-600 mb-2 drop-shadow-lg" />
      <h1 class="text-3xl font-extrabold text-green-700 mb-1 tracking-wide">CyberWealth</h1>
      <p class="text-gray-500 mb-6 text-center">{{ showRegister ? 'Crea tu cuenta' : 'Bienvenido, controla tus finanzas con estilo' }}</p>
      
      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
        {{ errorMessage }}
      </div>
      
      <!-- Mensaje de éxito -->
      <div v-if="successMessage" class="w-full mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
        {{ successMessage }}
      </div>
      
      <form @submit.prevent="showRegister ? doRegister() : doLogin()" class="w-full flex flex-col gap-4">
        <input 
          v-model="email" 
          type="email" 
          placeholder="Email" 
          class="rounded-lg px-4 py-2 border border-green-300 focus:ring-2 focus:ring-green-400 outline-none" 
          required 
        />
        <input 
          v-model="password" 
          type="password" 
          placeholder="Contraseña" 
          class="rounded-lg px-4 py-2 border border-green-300 focus:ring-2 focus:ring-green-400 outline-none" 
          required 
        />
        <input 
          v-if="showRegister"
          v-model="confirmPassword" 
          type="password" 
          placeholder="Confirmar contraseña" 
          class="rounded-lg px-4 py-2 border border-green-300 focus:ring-2 focus:ring-green-400 outline-none" 
          required 
        />
        <button 
          type="submit" 
          :disabled="loadingAuth"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loadingAuth ? 'Procesando...' : (showRegister ? 'Registrarse' : 'Iniciar sesión') }}
        </button>
      </form>
      
      <div class="mt-4 text-sm text-gray-600">
        {{ showRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?' }}
        <a href="#" @click.prevent="toggleRegister" class="text-green-700 font-semibold hover:underline">
          {{ showRegister ? 'Iniciar sesión' : 'Regístrate' }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth.js'

const router = useRouter()
const { login, register } = useAuth()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showRegister = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const loadingAuth = ref(false)

async function doLogin() {
  errorMessage.value = ''
  successMessage.value = ''
  loadingAuth.value = true
  
  const result = await login(email.value, password.value)
  loadingAuth.value = false
  
  if (result.success) {
    successMessage.value = 'Inicio de sesión exitoso'
    setTimeout(() => {
      router.replace('/')
    }, 500)
  } else {
    errorMessage.value = result.error
  }
}

async function doRegister() {
  errorMessage.value = ''
  successMessage.value = ''
  
  // Validar contraseñas coincidan
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }
  
  // Validar longitud mínima
  if (password.value.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  
  loadingAuth.value = true
  const result = await register(email.value, password.value)
  loadingAuth.value = false
  
  if (result.success) {
    successMessage.value = 'Registro exitoso. Redirigiendo...'
    setTimeout(() => {
      router.replace('/')
    }, 1000)
  } else {
    errorMessage.value = result.error
  }
}

function toggleRegister() {
  showRegister.value = !showRegister.value
  errorMessage.value = ''
  successMessage.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
