<template>

  <div class="flex flex-col md:flex-row md:items-end gap-1 mb-3">
    <div>
      <label class="mb-1 block text-xs">Bulan :</label>
      <DatePicker v-model="filter.bulan" view="month" dateFormat="mm/yy" size="small"/>
    </div>
    <div>
      <Button @click="getData">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:search"/>
      </Button>
    </div>
  </div>
  
  <Card>
    <template #content>

      <table class="w-full">
        <thead>
          <tr class="border border-b">
            <th class="px-3 py-2 text-left">Jenis</th>
            <th class="px-3 py-2 text-left">Total</th>
            <th class="px-3 py-2 text-right">Nominal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data.data" v-for="item in data.data" :key="item.jenis" class="border border-b">
            <td class="px-3 py-2 text-left">
              <span class="cursor-pointer hover:underline" @click="openDialog(item)">
              {{ item.jenis }}
              </span>
            </td>
            <td class="px-3 py-2 text-left">{{ item.total }}</td>
            <td class="px-3 py-2 text-right">{{ formatMoney(item.nominal,'Rp',0) }}</td>
          </tr>
        </tbody>
      </table>
      
    </template>
  </Card>

  <Dialog v-model:visible="visibleDialog" modal header="" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <div v-if="dataDialog">
      <pre>
      {{ dataDialog.webhosts }}
      </pre>
      <DataTable 
      :value="dataDialog.projects" 
      size="small" 
      class="text-xs" 
      stripedRows scrollHeight="75vh" 
      scrollable
    >
    <Column field="nama_web" header="Nama Web">
      <template #body="slotProps">
        {{ slotProps.data.nama_web }}
      </template>
    </Column>
    </DataTable>
    </div>
  </Dialog>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Laporan Siklus Layanan',
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const router = useRouter()

const filter = reactive({
    bulan: route.query.bulan_end || dayjs().format(''),
} as any)
function updateRouteParams() {
  router.push({
    query: { ...filter },
  });
}

const loading = ref(false);
const data = ref([] as any);
const getData = async () => {
  loading.value = true;

  //ubah bulan ke format YYYY-MM
  filter.bulan = dayjs(filter.bulan).utc().local().format('YYYY-MM');
  updateRouteParams()

  try {
    const response = await client('/api/laporan/siklus_layanan',{
      params: filter,
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

const visibleDialog = ref(false);
const dataDialog = ref({} as any);
const openDialog = async (data = {}) => {
  visibleDialog.value = true;
  dataDialog.value = data;
}

</script>
