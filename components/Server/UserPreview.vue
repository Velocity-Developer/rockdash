<template>
  <div>
    Component: Server/UserPreview
  </div>

  {{ user }}

</template>

<script setup lang="ts">
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  server: {
    type: Number,
    required: true,
  }
})
const emit = defineEmits(['update','delete'])
const client = useSanctumClient()
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
</script>
