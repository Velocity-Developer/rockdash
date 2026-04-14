<script setup lang="ts">
definePageMeta({
    title: 'Laporan Pembuatan',
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const router = useRouter()

const filter = reactive({
    bulan: route.query.bulan
      ? dayjs(String(route.query.bulan)).toDate()
      : dayjs().toDate()
} as any)
function updateRouteParams() {
  router.push({
    query: {       
      bulan: filter.bulan ?dayjs(filter.bulan).format('YYYY-MM'):null
     },
  });
}


const first = ref(0);
const onPage = (event: any) => {
  first.value = event.first
}

const loading = ref(false);
const data = ref([] as any);
const getData = async () => {
  loading.value = true;
  updateRouteParams()

  try {
    const response = await client('/api/laporan/pembuatan_bulanan',{
      params: {
        bulan: filter.bulan ?dayjs(filter.bulan).format('YYYY-MM'):null
      },
    });
    data.value = response;
    loading.value = false;
  } catch (error) {
    const er = useSanctumError(error);
    loading.value = false;
  }

  loading.value = false;
}

onMounted(()=>{
  getData()
})
</script>

<template>
  
  <div class="flex flex-col md:flex-row md:items-end gap-1 mb-3">
    <div>
      <label for="filter_bulan" class="mb-1 block text-xs">Bulan :</label>
      <DatePicker v-model="filter.bulan" view="month" dateFormat="mm/yy" size="small" name="filter_bulan"/>
    </div>
    <div>
      <Button @click="getData">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:search"/>
      </Button>
    </div>
  </div>

  <Card>
    <template #header>
      <div class="px-4 pt-4 font-bold">
      Laporan Pembuatan
      </div>
    </template>
    <template #content>
      <DataTable
        stripedRows scrollHeight="70vh" scrollable 
        :value="data.data" 
        size="small" class="text-sm"
      >
         <Column field="total_bulan_ini" header="Total Bulan Ini">
          <template #body="slotProps">
              {{ slotProps.data.total_bulan_ini }}
          </template>
        </Column>
        <Column field="total_bulan_sebelumnya" header="Total Bulan Sebelumnya">
          <template #body="slotProps">
              {{ slotProps.data.total_bulan_sebelumnya }}
          </template>
        </Column>
        <Column field="total" header="Total">
          <template #body="slotProps">
              {{ slotProps.data.total }}
          </template>
        </Column>
        <Column field="kontribusi" header="Kontribusi">
          <template #body="slotProps">
              {{ slotProps.data.kontribusi }}
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <DashLoader :loading="loading"/>
  
</template>

<style scoped></style>
