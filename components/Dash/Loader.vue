<template>
  <div v-if="loading" class="fixed bottom-5 end-5 z-[999]">
    <div class="flex gap-2 items-center text-primary-600 dark:text-primary-200 bg-primary-200 dark:bg-primary-700 py-2 px-4 rounded text-sm">
      <Icon name="lucide:loader-circle" class="animate-spin" />
      {{ label }}
      <span class="animate-bounce">...</span>
      <span class="animate-bounce">..</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    loading: Boolean,
    label: String,
  })
  const label = computed(() => props.label || 'Memuat data')
</script>
