<template>
  <pre>
    {{ data }}
  </pre>

  <div class="border border-emerald-200 bg-emerald-50 p-4 rounded-md">
    <div class="mb-3 font-bold">
      Info Project
    </div>
    <div class="flex items-center gap-2">
      <div class="text-sm opacity-70">Website : </div>
      <div>{{ data.webhost.nama_web }}</div>
    </div>
  </div>

</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  action: {
    type: String,
    default: 'edit',
  }
})
</script>
