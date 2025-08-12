<template>
  <Badge :severity="status.severity">
    {{ status.label }}
  </Badge>
</template>

<script setup lang="ts">
const props = defineProps({
  status: {
    type: String,
    default: 'ongoing'
  }
})

const statuses = {
  ongoing: {
    label: 'Ongoing',
    severity: 'info'
  },
  completed: {
    label: 'Completed',
    severity: 'success'
  },
  canceled: {
    label: 'Canceled',
    severity: 'danger'
  }
} as any

const status = computed(() => {
  return statuses[props.status]
})


</script>
