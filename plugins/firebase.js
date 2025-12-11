// plugins/firebase.js
/**
 * INSTRUCCIONES PARA CONFIGURAR FIREBASE:
 * 
 * 1. Ve a https://console.firebase.google.com/
 * 2. Crea un nuevo proyecto o selecciona uno existente
 * 3. En la configuración del proyecto, selecciona "Agregar app" > "Web"
 * 4. Registra tu app y copia las credenciales que aparecen
 * 5. En Firebase Console, activa:
 *    - Authentication > Sign-in method > Email/Password
 *    - Firestore Database > Crear base de datos > Modo de prueba (para desarrollo)
 * 6. Reemplaza los valores TU_* abajo con tus credenciales reales
 * 
 * IMPORTANTE: Para producción, usa variables de entorno (.env)
 */
import { defineNuxtPlugin } from '#app'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export default defineNuxtPlugin(() => {
  const firebaseConfig = {
    apiKey: 'AIzaSyBhYxfR2H10wxDai0AvaGEJ9mRUeZ6dk9o',
    authDomain: 'cyberwealth-finanzas.firebaseapp.com',
    projectId: 'cyberwealth-finanzas',
    storageBucket: 'cyberwealth-finanzas.firebasestorage.app',
    messagingSenderId: '949948326918',
    appId: '1:949948326918:web:703bb19888d6f15c460f87',
    measurementId: "G-367ECDFYBJ"
  }

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)

  return {
    provide: {
      auth,
      db,
    },
  }
})
