<template>
  <div class="flex items-center gap-2 px-4 py-2 bg-yellow-300 rounded-full shadow-md">
    <button 
      v-if="showBack" 
      @click="$emit('back')" 
      class="p-2 hover:bg-yellow-400 rounded-full transition-colors">
      <Icon icon="mdi:arrow-left" class="text-xl" />
    </button>

    <button 
      v-if="showFilter" 
      @click="$emit('filter')" 
      class="p-2 hover:bg-yellow-400 rounded-full transition-colors">
      <Icon icon="mdi:filter" class="text-xl" />
    </button>

    <button 
      v-if="showSave" 
      @click="$emit('save')" 
      class="p-2 hover:bg-yellow-400 rounded-full transition-colors">
      <Icon icon="mdi:content-save" class="text-xl" />
    </button>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  showBack: {
    type: Boolean,
    default: true
  },
  showFilter: {
    type: Boolean,
    default: true
  },
  showSave: {
    type: Boolean,
    default: true
  }
})

defineEmits(['back', 'filter', 'save'])
</script>
