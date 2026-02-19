<script setup lang="ts">
definePageMeta({
  title: 'Kelola Quality',
  description: 'Daftar Quality untuk Web Master',
})

const client = useSanctumClient()

const loading = ref(false)
const items = ref<{ value: string; label: string }[]>([])

async function loadQuality() {
  loading.value = true
  try {
    const res = await client('/api/quality') as any
    items.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadQuality()
})

const columns = [
  { field: 'label', header: 'Nama Quality' },
]
</script>
<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h1 class="text-lg font-semibold">
        Kelola Quality
      </h1>
      <Button
        size="small"
        :loading="loading"
        @click="loadQuality"
      >
        <Icon name="lucide:refresh-ccw" /> Refresh
      </Button>
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
          <Column field="detail" header="Detail" />

          <Column field="act" header="">
            <template #body="slotProps">
              <div class="flex justify-end item-center gap-1">
                <Button size="small" severity="info">
                  <Icon name="lucide:pen"/>
                </Button>
                <Button size="small" severity="danger">
                  <Icon name="lucide:trash-2"/>
                </Button>
              </div>
            </template>
          </Column>

        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped></style>
