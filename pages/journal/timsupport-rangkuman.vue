<script setup lang="ts">
definePageMeta({
    title: 'Rangkuman Jurnal Tim Support',
    description: 'Rangkuman Jurnal Tim Support',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient();

const route = useRoute();
const router = useRouter();

const filters = reactive({
  month: route.query.month ? dayjs(String(route.query.month)).toDate() : dayjs().startOf('month').toDate(),
  user_id: route.query.user_id ? String(route.query.user_id) : null,
})

watch(filters, () => {
  router.replace({
    query: {
      ...route.query,
      month: dayjs(filters.month).format('YYYY-MM'),
      user_id: filters.user_id || undefined,
    }
  })
}, { deep: true })

const { data, status, refresh } = await useAsyncData('rangkuman_timsupport', () => 
  client("/api/journal_timsupport_rangkuman",{
    params: {
      month: dayjs(filters.month).format('YYYY-MM'),
      user_id: filters.user_id,
    },
  }) as any
) as any
</script>

<template>


    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">

      <div class="col-span-4 flex justify-end items-center gap-2">
        <DatePicker view="month" size="small" dateFormat="mm/yy" v-model="filters.month" @change="refresh()" />
        <Button size="small" @click="refresh()">
          <Icon name="lucide:refresh-cw" :class="status=='pending'?'animate-spin':''"/> Refresh
        </Button>
      </div>

      <Card class="md:col-span-2">
        <template #header>
          <div class="flex pt-4 px-4 justify-start items-center gap-2">
            <Icon name="lucide:headset" />
            <span class="text-sm">Total Response Time</span>
          </div>
        </template>
        <template #content>
          
            <div v-if="data && data.data.length > 0">

              <DataTable :value="data.data" class="text-sm" stripedRows>                
                <Column field="category" header="Kategori"></Column>
                <Column field="avg_minutes" sortable header="Response Time">                  
                  <template #body="slotProps">
                    {{ slotProps.data.avg_minutes?Number(slotProps.data.avg_minutes).toFixed(1):'-' }} Menit
                  </template>
                </Column>
              </DataTable>

              <div class="px-3 py-3">
                Total: <span class="font-bold">{{ data.total_avg?Number(data.total_avg).toFixed(1):'-' }} Menit</span>
              </div>

            </div>

            <div v-else class="flex justify-center items-center gap-2 p-4 opacity-50 text-sm">
              <Icon name="lucide:clock-fading" /> Belum ada data
            </div>

        </template>
      </Card>
    </div>


    <DashLoader :loading="status=='pending'" />

</template>

<style scoped></style>
