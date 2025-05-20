<template>
  
  <Card class="md:h-[100%] dark:bg-zinc-800">
    <template #content>

      <div>
        <div class="text-sm dark:text-zinc-400">Project Bulan ini</div>
      </div>
      <div>
        <Chart type="line" :data="chartData" :options="chartOptions" class="h-[100px]" />
      </div>
    
    </template>
  </Card>

</template>

<script setup lang="ts">
const client = useSanctumClient();
const { data, status, error, refresh } = await useAsyncData(
    'dashboard-chart_bulanini',
    () => client('/api/dashboard/chart_bulanini')
)

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});


const chartData = ref();
const chartOptions = ref();

const setChartData = () => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: data.value?.labels,
        datasets: [
            {
                label: 'Total Task',
                backgroundColor: documentStyle.getPropertyValue('--primary'),
                borderColor: documentStyle.getPropertyValue('--primary'),
                data: data.value?.data,
                pointRadius: 0,
                tension: 0.4
            }
        ]
    };
};
const setChartOptions = () => {
    return {
        maintainAspectRatio: false,
        aspectRatio: 0.20,
        plugins: {
            legend: {
                labels: false
            },
            tooltip: {
                enabled: true
            }
        },
        scales: {
            x: {
              display: false
            },
            y: {
              display: false
            }
        }
    };
}
</script>
