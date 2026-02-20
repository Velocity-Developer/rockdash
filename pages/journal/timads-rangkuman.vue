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
  () => {
    chartData.value = setChartData();
  },
  { deep: true }
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

          <table class="table-fixed w-full">
            <thead class="text-left">
              <tr>
                <th class="p-2 bg-gray-100 dark:bg-gray-800">Kategori</th>
                <th class="p-2 bg-gray-100 dark:bg-gray-800">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in dataAnalytics.by_category">
                <td class="p-2 border-t">
                  {{ item.journal_category.name }}
                </td>
                <td class="p-2 border-t">
                  {{ item.total }}
                </td>
              </tr>
            </tbody>
          </table>

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

  </div>
</template>

<style scoped></style>
