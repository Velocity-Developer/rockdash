<template>
  <div v-if="loading" class="fixed bottom-0 end-0 start-[50%] translate-x-[-50%] z-[999] p-2">
    <ProgressBar mode="indeterminate" style="height: 12px"></ProgressBar>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    loading: Boolean,
    label: String,
  })
  const label = computed(() => props.label || 'Memuat data')
</script>
