import { ref } from 'vue'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  onSnapshot 
} from 'firebase/firestore'
import { useAuth } from './useAuth'

/**
 * Composable para operaciones CRUD en Firestore
 * Todos los datos se guardan bajo users/{userId}/{collectionName}
 */
export function useFirestore(collectionName) {
  const { $db } = useNuxtApp()
  const { currentUser } = useAuth()
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Referencia a la colección del usuario
  function getUserCollection() {
    if (!currentUser.value) {
      throw new Error('Usuario no autenticado')
    }
    return collection($db, `users/${currentUser.value.uid}/${collectionName}`)
  }

  // Leer todos los documentos
  async function fetchItems(orderByField = null) {
    if (!currentUser.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const collectionRef = getUserCollection()
      const q = orderByField 
        ? query(collectionRef, orderBy(orderByField))
        : collectionRef
      
      const querySnapshot = await getDocs(q)
      items.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return items.value
    } catch (err) {
      console.error(`Error al leer ${collectionName}:`, err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Agregar documento
  async function addItem(data) {
    if (!currentUser.value) {
      throw new Error('Usuario no autenticado')
    }
    
    loading.value = true
    error.value = null
    
    try {
      const collectionRef = getUserCollection()
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      const newItem = { id: docRef.id, ...data }
      items.value.push(newItem)
      
      return { success: true, id: docRef.id }
    } catch (err) {
      console.error(`Error al agregar ${collectionName}:`, err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Actualizar documento
  async function updateItem(id, data) {
    if (!currentUser.value) {
      throw new Error('Usuario no autenticado')
    }
    
    loading.value = true
    error.value = null
    
    try {
      const docRef = doc($db, `users/${currentUser.value.uid}/${collectionName}`, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      })
      
      // Actualizar en el array local
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value[index] = { ...items.value[index], ...data }
      }
      
      return { success: true }
    } catch (err) {
      console.error(`Error al actualizar ${collectionName}:`, err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Eliminar documento
  async function deleteItem(id) {
    if (!currentUser.value) {
      throw new Error('Usuario no autenticado')
    }
    
    loading.value = true
    error.value = null
    
    try {
      const docRef = doc($db, `users/${currentUser.value.uid}/${collectionName}`, id)
      await deleteDoc(docRef)
      
      // Eliminar del array local
      items.value = items.value.filter(item => item.id !== id)
      
      return { success: true }
    } catch (err) {
      console.error(`Error al eliminar ${collectionName}:`, err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Listener en tiempo real (opcional)
  function subscribeToChanges(callback) {
    if (!currentUser.value) return () => {}
    
    const collectionRef = getUserCollection()
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      items.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      if (callback) callback(items.value)
    }, (err) => {
      console.error(`Error en listener ${collectionName}:`, err)
      error.value = err.message
    })
    
    return unsubscribe
  }

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    subscribeToChanges
  }
}
