<template>
  <Badge :severity="status.severity" class="truncate" size="small">
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
    label: 'Proses',
    severity: 'info'
  },
  completed: {
    label: 'Selesai',
    severity: 'success'
  },
  cancelled: {
    label: 'Batal',
    severity: 'danger'
  },
  archived: {
    label: 'Arsip',
    severity: 'contrast'
  },
  draft: {
    label: 'Draft',
    severity: 'primary'
  },
  followup: {
    label: 'Follow Up',
    severity: 'warning'
  }
} as any

const status = computed(() => {
  return statuses[props.status]
})


</script>
