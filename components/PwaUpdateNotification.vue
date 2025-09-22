<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full"
    >
      <div
        v-if="showNotification"
        class="fixed bottom-4 right-4 z-50 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
              <Icon name="lucide:download" class="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Update Tersedia
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Versi baru aplikasi telah tersedia. Update sekarang untuk mendapatkan fitur terbaru dan perbaikan bug.
            </p>
            
            <div class="flex gap-2">
              <Button
                @click="updateApp"
                :loading="isUpdating"
                size="small"
                class="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 text-xs"
              >
                <Icon v-if="!isUpdating" name="lucide:download" class="w-3 h-3 mr-1" />
                {{ isUpdating ? 'Mengupdate...' : 'Update Sekarang' }}
              </Button>
              
              <Button
                @click="dismissNotification"
                variant="outlined"
                size="small"
                class="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 text-xs"
              >
                Nanti Saja
              </Button>
            </div>
          </div>
          
          <button
            @click="dismissNotification"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false
})

const emit = defineEmits<{
  update: []
  dismiss: []
}>()

const showNotification = ref(props.show)
const isUpdating = ref(false)

watch(() => props.show, (newValue) => {
  showNotification.value = newValue
})

const updateApp = async () => {
  isUpdating.value = true
  
  try {
    // Emit update event to parent
    emit('update')
    
    // Simulate update process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reload the page to apply updates
    window.location.reload()
  } catch (error) {
    console.error('Error updating app:', error)
    isUpdating.value = false
  }
}

const dismissNotification = () => {
  showNotification.value = false
  emit('dismiss')
}

// Auto dismiss after 30 seconds if no action taken
onMounted(() => {
  if (props.show) {
    setTimeout(() => {
      if (showNotification.value) {
        dismissNotification()
      }
    }, 30000)
  }
})
</script>

<style scoped>
/* Additional custom styles if needed */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>