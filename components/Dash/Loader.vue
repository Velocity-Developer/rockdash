<template>
  <div v-if="loading" class="fixed bottom-0 end-0 z-[999] p-2 flex items-center gap-1">
    <Chip :label="label" size="small" class="text-sm shadow">              
        <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="6" fill="transparent"
                animationDuration=".5s" :aria-label="label" />
                <span>{{ label }}</span>
    </Chip>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    loading: Boolean,
    label: String,
  })
  const label = computed(() => props.label || 'Memuat...')
</script>
