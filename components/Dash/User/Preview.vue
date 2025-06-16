<template>

  <div v-if="data">
    <div v-for="item in fields" :key="item.key" class="border-b dark:border-zinc-800 py-1">
      {{ item.label }} : {{ data[item.key] }}
    </div>
  </div>

</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    required: true,
  }
})

const fields = [
  {
    key:'username',
    label: 'Username',
  }
]

</script>