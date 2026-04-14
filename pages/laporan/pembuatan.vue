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

const chartData = ref();
const chartOptions = ref();
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
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
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

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const chartItems = data.value?.chart || [];

  return {
    labels: chartItems.map((item: any) => item.via),
    datasets: [
      {
        label: 'Bulan Ini',
        backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
        borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
        data: chartItems.map((item: any) => item.total_bulan_ini),
      },
      {
        label: 'Bulan Sebelumnya',
        backgroundColor: documentStyle.getPropertyValue('--p-orange-400'),
        borderColor: documentStyle.getPropertyValue('--p-orange-400'),
        data: chartItems.map((item: any) => item.total_bulan_sebelumnya),
      },
    ],
  };
};

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--p-text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
    },
  };
};
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

  <div class="grid grid-cols-4 gap-4">

    <Card class="col-span-4 md:col-span-2">
      <template #header>
        <div class="px-4 pt-4 font-bold">
        Pembuatan
        </div>
      </template>
      <template #content>
        <DataTable
          stripedRows scrollHeight="70vh" scrollable 
          :value="data.data" 
          size="small" class="text-sm"
        >
          <Column field="via" header="Via">
            <template #body="slotProps">
                {{ slotProps.data.via }}
            </template>
          </Column>
          <Column field="total_bulan_ini" header="Total Bulan Ini">
            <template #body="slotProps">
                {{ slotProps.data.total_bulan_ini }} <span v-if="!slotProps.data.via">%</span>
            </template>
          </Column>
          <Column field="total_bulan_sebelumnya" header="Total Bulan Sebelumnya">
            <template #body="slotProps">
                {{ slotProps.data.total_bulan_sebelumnya }} <span v-if="!slotProps.data.via">%</span>
            </template>
          </Column>
          <Column field="total" header="Total">
            <template #body="slotProps">
                {{ slotProps.data.total }}
            </template>
          </Column>
          <Column field="kontribusi" header="Kontribusi">
            <template #body="slotProps">
                {{ slotProps.data.kontribusi ? slotProps.data.kontribusi +'%' : '' }}
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
    
    <Card class="col-span-4 md:col-span-2">
      <template #header>
        <div class="px-4 pt-4 font-bold">
          Grafik Pembuatan
        </div>
      </template>
      <template #content>
        <Chart
          v-if="chartData"
          type="bar"
          :data="chartData"
          :options="chartOptions"
          class="h-[20rem] md:h-[28rem]"
        />
      </template>
    </Card>

  </div>

  <DashLoader :loading="loading"/>
  
</template>

<style scoped></style>
