<script setup lang="ts">
definePageMeta({
  title: 'Kelola Data Cuti',
  description: 'Catatan cuti karyawan',
})

import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient()

const loading = ref(false)
const tahun = ref(dayjs().format('YYYY'))
const items = ref<any[]>([])

async function loadData() {
  loading.value = true
  try {
    const res = await client('/api/cuti', {
      params: {
        tahun: tahun.value,
      },
    }) as any
    items.value = Array.isArray(res.data) ? res.data : []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h1 class="text-lg font-semibold">
        Kelola Data Cuti
      </h1>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 text-sm">
          <span>Tahun</span>
          <InputText
            v-model="tahun"
            size="small"
            class="w-24"
          />
        </div>
        <Button
          size="small"
          @click="loadData()"
          :loading="loading"
        >
          <Icon
            name="lucide:refresh-cw"
            :class="loading ? 'animate-spin' : ''"
          />
          Refresh
        </Button>
      </div>
    </div>

    <Card>
      <template #content>
        <DataTable
          :value="items"
          size="small"
          stripedRows
          :loading="loading"
          scrollable
          scrollHeight="70vh"
        >
          <Column
            header="#"
            headerStyle="width:3rem"
          >
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>
          <Column field="nama" header="Nama" />
          <Column field="total" header="Total Cuti" />
          <Column header="Detail">
            <template #body="slotProps">
              <DataTable
                :value="slotProps.data.items"
                size="small"
                class="mt-2 border rounded-md"
              >
                <Column field="tanggal" header="Tanggal">
                  <template #body="detailProps">
                    {{ detailProps.data.tanggal }}
                  </template>
                </Column>
                <Column field="jenis" header="Jenis" />
                <Column field="tipe" header="Tipe" />
                <Column field="time" header="Time" />
                <Column field="detail" header="Detail" />
              </DataTable>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped></style>
