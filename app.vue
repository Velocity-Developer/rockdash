<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toast />
  <ConfirmDialog/>
  <PwaUpdateNotification 
    :show="showUpdateNotification" 
    @update="updatePwa"
    @dismiss="dismissUpdate"
  />
</template>

<script setup lang="ts">
// Use PWA update composable
const { 
  showUpdateNotification, 
  updatePwa, 
  dismissUpdate, 
  initPwaUpdateDetection 
} = usePwaUpdate()

// Initialize PWA update detection on mount
onMounted(() => {
  initPwaUpdateDetection()
})
</script>