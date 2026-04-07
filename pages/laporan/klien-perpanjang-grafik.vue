<template>
  <div class="space-y-5">

    <div class="flex items-center gap-1">
      <DatePicker @value-change="getData" v-model="filters.tahun" view="year" dateFormat="yy" size="small" class="min-w-[222px]" :loading="loading" showIcon/>
      <Button size="small" @click="getData">
        <Icon name="lucide:refresh-cw" /> Reload
      </Button>
      <Button size="small" severity="contrast" asChild v-slot="slotProps">
        <RouterLink to="/laporan/klien-perpanjang" :class="slotProps.class">
          <Icon name="lucide:chart-line" size="0.75rem" /> Rincian Laporan
        </RouterLink>
      </Button>
    </div>

    <div class="grid grid-cols-12 gap-4 xl:gap-6">

      <Card class="col-span-12 md:col-span-6 xl:col-span-4">
        <template #header>
          <div class="flex justify-between items-center px-6 pt-4">
            <span class="font-bold">Daftar bulanan</span>
          </div>
        </template>
        <template #content>
          <DataTable :value="data.data" class="text-sm" :loading="loading" stripedRows>
            <Column field="month" header="Bulan" class="text-teal-600 dark:text-teal-100">
              <template #body="slotProps">
                  {{ slotProps.data.month || '-' }}
              </template>
            </Column>
            <Column field="perpanjang" header="Perpanjang">
              <template #body="slotProps">
                  {{ formatMoney(slotProps.data.perpanjang || 0,'false',0) }}
              </template>
            </Column>
            <Column field="tidak_perpanjang" header="Tidak Perpanjang">
              <template #body="slotProps">
                  {{ formatMoney(slotProps.data.tidak_perpanjang || 0,'false',0) }}
              </template>
            </Column>
            <Column field="total" header="Total">
              <template #body="slotProps">
                  {{ formatMoney(slotProps.data.total || 0,'false',0) }}
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <Card class="col-span-12 md:col-span-6 xl:col-span-8">
        <template #header>
          <div class="flex justify-between items-center px-6 pt-4">
            <span class="font-bold">Grafik bulanan</span>
          </div>
        </template>
        <template #content>
          <Chart type="bar" :data="chartData" :options="chartOptions" class="h-[15rem] md:h-[30rem]" />
        </template>
      </Card>


      <div class="col-span-12 mt-10 flex justify-between">        
        <span class="font-bold text-lg">
          Rincian bulanan
        </span>
        <ToggleButton v-model="viewRincianBulananTable" class="w-24" onLabel="Table" offLabel="Card" size="small"/>
      </div>
      

      <Card v-if="!loading && !viewRincianBulananTable" v-for="item in data.data" :key="item.month" class="col-span-12 md:col-span-6 xl:col-span-4">
        <template #header>
          <div class="flex justify-between items-center px-6 pt-4 text-sky-600 dark:text-sky-100">
            <span>{{ item.month+' '+item.year || '-' }}</span>
          </div>
        </template>
        <template #content class="overflow-x-auto">
          <table class="table w-full text-sm">
            <tbody>
              <tr v-for="(value, key) in item.rincian" :key="key" class="odd:bg-gray-50 dark:odd:bg-slate-900">
                <td class="px-3 py-1 border-t dark:border-slate-700">{{ key }}</td>
                <td class="px-3 py-1 border-t dark:border-slate-700 text-right">{{ formatMoney(value,'false',0) }}</td>
              </tr>
            </tbody>
          </table>
        </template>
      </Card>

      <div v-if="loading" v-for="item in 12" class="col-span-12 md:col-span-6 xl:col-span-4">
        <Skeleton width="100%" height="15rem"></Skeleton>
      </div>

      <Card v-if="!loading && viewRincianBulananTable" class="col-span-12">
        <template #content>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead v-if="data.data">
                <tr class="whitespace-nowrap font-normal">
                  <th class="px-3 py-2 border-b dark:border-slate-700">
                    Bulan
                  </th>
                  <th v-for="(label,key) in data.data[0].rincian" :key="key" class="px-3 py-2 border-b dark:border-slate-700">
                    {{ key }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in data.data" :key="item.month" class="odd:bg-gray-50 dark:odd:bg-slate-900">
                  <td class="px-3 py-2 border-b dark:border-slate-700">
                    {{ item.month+' '+item.year || '-' }} 
                  </td>
                  <td v-for="(value, key) in item.rincian" :key="key" class="px-3 py-2 border-b dark:border-slate-700 text-right">
                    {{ formatMoney(value,'false',0) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </Card>

    </div>
    
  </div>

  <DashLoader :loading="loading"/>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Grafik Laporan Klien Perpanjang',
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const router = useRouter()
const viewRincianBulananTable = ref(false)

const filters = reactive({
    tahun: route.query.tahun
      ? dayjs(String(route.query.tahun)).toDate()
      : dayjs().toDate(),
} as any)
function updateRouteParams() {
  router.push({
    query: {       
      tahun: filters.tahun ?dayjs(filters.tahun).format('YYYY'):null,
     },
  });
}

const chartData = ref();
const chartOptions = ref();

const loading = ref(false);
const data = ref([] as any);
const getData = async () => {
  loading.value = true;
  updateRouteParams()

  try {
    const response = await client('/api/laporan/klien_perpanjang_grafik',{
      params: {
        tahun: filters.tahun ?dayjs(filters.tahun).format('YYYY'):null,
      },
    });
    data.value = response;
    loading.value = false;

    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
    
    
  } catch (error) {
    const er = useSanctumError(error);
    loading.value = false;
  }

  loading.value = false;
}

onMounted(()=>{
  getData()
})

const setChartData = () =>  {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: data.value.data.map((item: any) => item.month),
        datasets: [
            {
                type: 'bar',
                label: 'Perpanjang',
                backgroundColor: documentStyle.getPropertyValue('--p-teal-500'),
                data: data.value.data.map((item: any) => item.perpanjang)
            },
            {
                type: 'bar',
                label: 'Tidak Perpanjang',
                backgroundColor: documentStyle.getPropertyValue('--p-orange-200'),
                data: data.value.data.map((item: any) => item.tidak_perpanjang)
            }
        ]
    };
};
const setChartOptions = () =>  {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: (context: any) => {
                        if (context.datasetIndex !== 0) {
                            return '';
                        }

                        const item = data.value.data?.[context.dataIndex];

                        if (!item) {
                            return '';
                        }

                        return [
                            `Total: ${formatMoney(item.total || 0, 'false', 0)}`,
                            `Perpanjang: ${formatMoney(item.perpanjang || 0, 'false', 0)}`,
                            `Tidak Perpanjang: ${formatMoney(item.tidak_perpanjang || 0, 'false', 0)}`,
                            `Ratio Perpanjang: ${item.ratio || '-'}`
                        ];
                    }
                }
            },
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                stacked: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}
</script>
