<script setup lang="ts">
definePageMeta({
    title: 'Rangkuman Jurnal Tim Ads',
    description: 'Rangkuman Jurnal Tim Ads',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient();
const route = useRoute();
const router = useRouter();

const filters = reactive({
  month: route.query.month ? dayjs(String(route.query.month)).toDate() : dayjs().startOf('month').toDate(),
  user_id: route.query.user_id ? Number(route.query.user_id) : null,
})

const { data : dataAnalytics, status, refresh } = await useAsyncData('rangkuman_timads', () => 
  client("/api/journal_timads_rangkuman",{
    params: {
      month: dayjs(filters.month).format('YYYY-MM'),
      user_id: filters.user_id,
    },
  }) as any
) as any

const chartData = ref();
const chartOptions = ref();
const selectedCategories = ref([] as any[]);
const totalSelected = computed(() =>
  selectedCategories.value.reduce(
    (sum, item: any) => sum + (item.total ?? 0),
    0
  )
);

const setChartData = () => {
  if (!dataAnalytics.value || !dataAnalytics.value.by_category) return null;

  const labels = dataAnalytics.value.by_category.map(
    (item: any) => item.journal_category?.name ?? '(kosong)'
  );

  const totals = dataAnalytics.value.by_category.map(
    (item: any) => item.total ?? 0
  );

  const backgroundColors = [
    '#FFB0B0',
    '#FFD09B',
    '#FFECC8',
    '#FFF7D1',
    '#A594F9',
    '#CDC1FF',
    '#F5EFFF',
    '#295F98',
    '#D2DCB6',
    '#F1F3E0',
  ];

  return {
    labels,
    datasets: [
      {
        label: 'Total',
        data: totals,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderWidth: 1,
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

onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

watch(
  () => dataAnalytics.value?.by_category,
  (newVal) => {
    chartData.value = setChartData();
    selectedCategories.value = newVal ? [...newVal] : [];
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="grid grid-cols-4 gap-4">
    
    <div class="col-span-4 flex justify-end items-center gap-2">
      <Select 
        v-if="isPermissions('timads-journal-perform-tim')"  
        v-model="filters.user_id" 
        :options="dataAnalytics.users_ads" 
        size="small" 
        placeholder="Pilih User" 
        optionLabel="name"
        optionValue="id" showClear
      />
      <DatePicker view="month" size="small" dateFormat="mm/yy" v-model="filters.month" />
      <Button size="small" @click="refresh()">
        <Icon name="lucide:refresh-cw" :class="status=='pending'?'animate-spin':''"/> Refresh
      </Button>
    </div>

    <div class="col-span-4 mt-6 text-xl md:text-2xl flex items-center gap-2">
        <template v-if="dataAnalytics && dataAnalytics.user_data?.name">
          <div class="flex justify-center items-center gap-2">
            <Avatar :image="dataAnalytics.user_data.avatar_url" shape="circle"/>
            Performa {{ dataAnalytics.user_data.name || '-' }}
          </div>
        </template>
        <template v-else>
          <span class="w-8 h-8 rounded bg-blue-500 text-white flex justify-center items-center"><Icon name="lucide:users" /></span>
          Performa Seluruh Tim Ads
        </template>
      </div>

    <Card class="col-span-4 md:col-span-2">
        <template #header>
          <div class="flex pt-4 px-4 justify-start items-center gap-2">
            <Icon name="lucide:headset" />
            <span class="text-sm">Total Berdasarkan Kategori</span>
          </div>
        </template>
        <template #content>

          <div
            v-if="dataAnalytics && dataAnalytics.by_category && dataAnalytics.by_category.length"
          >
            <DataTable
              :value="dataAnalytics.by_category"
              v-model:selection="selectedCategories"
              size="small"
              class="text-sm"
              stripedRows
            >
              <Column selectionMode="multiple" headerStyle="width: 3rem" />
              <Column field="journal_category.name" header="Kategori">
                <template #body="slotProps">
                  {{ slotProps.data.journal_category?.name ?? '(kosong)' }}
                </template>
              </Column>
              <Column field="total" header="Total">
                <template #body="slotProps">
                  {{ slotProps.data.total }}
                </template>
              </Column>
            </DataTable>

            <div class="mt-3 text-sm font-semibold flex justify-end">
              <span class="mr-1">Total:</span>
              <span>{{ totalSelected }}</span>
            </div>
          </div>

          <div
            v-else
            class="flex justify-center items-center h-32 gap-2 opacity-50 text-sm"
          >
            <Icon name="lucide:alert-triangle" />
            Belum ada data kategori
          </div>

        </template>
      </Card>

    <Card class="col-span-4 md:col-span-2">
       <template #header>
          <div class="flex pt-4 px-4 justify-start items-center gap-2">
            <Icon name="lucide:chart-column-stacked" />
            <span class="text-sm">Grafik Total Kategori</span>
          </div>
        </template>
        <template #content>
            <div class="h-[400px] p-2">              
                <Chart v-if="chartData" type="bar" :data="chartData" :options="chartOptions" class="h-full w-full" />
                <div v-else class="flex justify-center items-center h-full gap-2 opacity-50 text-sm">
                    <Icon name="lucide:bar-chart-2" /> Belum ada data
                </div>
            </div>
        </template>
    </Card>

    <div class="col-span-4 mt-6 text-xl" v-if="isPermissions('timads-journal-perform-tim') && !filters.user_id">
        Rincian Tim
    </div>

    <Card class="col-span-4" v-if="isPermissions('timads-journal-perform-tim') && !filters.user_id">
      <template #header>
        <div class="flex pt-4 px-4 justify-start items-center gap-2">
          <Icon name="lucide:users" />
          <span class="text-sm">Total jurnal per User</span>
        </div>
      </template>
      <template #content>
        <DataTable
              :value="dataAnalytics.categories"
              size="small"
              class="text-sm"
              stripedRows
            >
            <Column field="name" header="Kategori" frozen style="min-width: 200px"/>
            <Column v-for="col of dataAnalytics.users_ads" :key="col.id" :field="col.id" :header="col.name">
              <template #body="slotProps">
                {{ slotProps.data }}
                
                {{ col }}
              </template>
            </Column>
        </DataTable>
        
      </template>
    </Card>

  </div>
</template>

<style scoped></style>
