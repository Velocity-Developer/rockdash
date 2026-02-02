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

const chartData = ref();
const chartOptions = ref();

const setChartData = () => {
    if (!data.value?.data) return null;
    
    const items = data.value.data;
    const labels = items.map((item: any) => item.category);
    
    return {
        labels,
        datasets: [
            {
                label: 'Response Time (Menit)',
                data: items.map((item: any) => item.avg_minutes ? Number(item.avg_minutes).toFixed(1) : 0),
                backgroundColor: 'rgba(249, 115, 22, 0.5)', // Orange
                borderColor: 'rgba(249, 115, 22, 1)',
                borderWidth: 1,
                yAxisID: 'y'
            },
            {
                label: 'Total Jurnal',
                data: items.map((item: any) => item.total_journal),
                backgroundColor: 'rgba(6, 182, 212, 0.5)', // Cyan
                borderColor: 'rgba(6, 182, 212, 1)',
                borderWidth: 1,
                yAxisID: 'y1'
            }
        ]
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                },
                title: {
                    display: true,
                    text: 'Response Time (Menit)'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    drawOnChartArea: false,
                    color: surfaceBorder
                },
                title: {
                    display: true,
                    text: 'Total Jurnal'
                }
            }
        }
    };
};

onMounted(() => {
    chartOptions.value = setChartOptions();
    chartData.value = setChartData();
});

watch(data, () => {
    chartData.value = setChartData();
}, { deep: true });
</script>

<template>


    <div class="grid grid-cols-4 gap-4">

      <div class="col-span-4 flex justify-end items-center gap-2">
        <DatePicker view="month" size="small" dateFormat="mm/yy" v-model="filters.month" @change="refresh()" />
        <Button size="small" @click="refresh()">
          <Icon name="lucide:refresh-cw" :class="status=='pending'?'animate-spin':''"/> Refresh
        </Button>
      </div>

      <Card class="col-span-4 md:col-span-2">
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
                <Column field="total_journal" header="Total"></Column>
              </DataTable>

              <div class="flex justify-end items-center gap-2 px-3 py-3">
                <span class="border rounded-lg p-4">
                  Total Rata2 waktu: <span class="font-bold">{{ data.total_avg?Number(data.total_avg).toFixed(1):'-' }} Menit</span>
                </span>
                <span class="border rounded-lg p-4">
                  Total Jurnal: <span class="font-bold">{{ data.total_journal || '-' }}</span>
                </span> 
              </div>

            </div>

            <div v-else class="flex justify-center items-center gap-2 p-4 opacity-50 text-sm">
              <Icon name="lucide:clock-fading" /> Belum ada data
            </div>

        </template>
      </Card>

      <Card class="col-span-4 md:col-span-2">
        <template #header>
          <div class="flex pt-4 px-4 justify-start items-center gap-2">
            <Icon name="lucide:headset" />
            <span class="text-sm">Grafik Total Response Time</span>
          </div>
        </template>
        <template #content>
            <div class="h-[400px] p-2">
                <Chart v-if="chartData" type="bar" :data="chartData" :options="chartOptions" class="h-full w-full" />
                <div v-else class="flex justify-center items-center h-full opacity-50 text-sm">
                    <Icon name="lucide:bar-chart-2" /> Belum ada data
                </div>
            </div>
        </template>
      </Card>

    </div>


    <DashLoader :loading="status=='pending'" />

</template>

<style scoped></style>
