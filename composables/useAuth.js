import { ref, computed } from 'vue'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

const currentUser = ref(null)
const isLogged = computed(() => !!currentUser.value)
const loading = ref(true)

export function useAuth() {
  const { $auth } = useNuxtApp()

  // Inicializar listener de autenticación
  if (process.client && !currentUser.value) {
    onAuthStateChanged($auth, (user) => {
      currentUser.value = user
      loading.value = false
    })
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword($auth, email, password)
      currentUser.value = userCredential.user
      return { success: true }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: getErrorMessage(error.code) }
    }
  }

  async function register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword($auth, email, password)
      currentUser.value = userCredential.user
      return { success: true }
    } catch (error) {
      console.error('Error en registro:', error)
      return { success: false, error: getErrorMessage(error.code) }
    }
  }

  async function logout() {
    try {
      await signOut($auth)
      currentUser.value = null
      return { success: true }
    } catch (error) {
      console.error('Error en logout:', error)
      return { success: false, error: error.message }
    }
  }

  function getErrorMessage(code) {
    const messages = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El email ya está en uso',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'Email inválido',
      'auth/invalid-credential': 'Credenciales inválidas'
    }
    return messages[code] || 'Error de autenticación'
  }

  return { 
    currentUser, 
    isLogged, 
    loading,
    login, 
    register,
    logout 
  }
}
