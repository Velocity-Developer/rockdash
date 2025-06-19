<template>
  <div v-if="loading" class="fixed bottom-5 end-5 z-[999]">
    <div class="flex gap-2 items-center shadow-lg text-sm text-primary-600 dark:text-primary-200 bg-primary-50 dark:bg-zinc-800 py-1 px-3 rounded">
      {{ label }}
      <Icon name="lucide:loader-2" size="2rem" class="animate-spin" />
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
