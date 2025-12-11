<template>
  <MenuGrid v-if="isLogged" />
</template>

<script setup>
import MenuGrid from '~/components/MenuGrid.vue'
import { useAuth } from '~/composables/useAuth.js'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const { isLogged } = useAuth()
const router = useRouter()

onMounted(() => {
  if (!isLogged.value) {
    router.replace('/login')
  }
})
</script>
