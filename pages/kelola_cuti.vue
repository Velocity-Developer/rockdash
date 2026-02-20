<script setup lang="ts">
definePageMeta({
  title: 'Kelola Data Cuti',
  description: 'Catatan cuti karyawan',
})

import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient()
const toast = useToast()
const confirm = useConfirm()

const loading = ref(false)
const items = ref({})

async function loadData() {
  loading.value = true
  try {
    const res = await client('/api/cuti',{
      params: {
        tahun: dayjs().format('YYYY').toString()
      }
    }) as any
    items.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

</script>

<template>

  <div class="flex justify-end">
    <Button size="small" @click="loadData()" :loading="loading">
      <Icon name="lucide:refresh-cw" :class="loading?'animate-spin':''"/> Refresh
    </Button>
  </div>

  

  <pre>
  {{ items }}
  </pre>

</template>

<style scoped></style>
