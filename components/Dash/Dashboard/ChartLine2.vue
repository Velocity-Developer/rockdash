<template>
  
  <Card class="md:h-[100%] dark:bg-zinc-800">
    <template #content>

      <div>
        <div class="text-sm dark:text-zinc-400 mb-4">Project Tahun ini</div>
      </div>
      <div>
        <Chart type="line" :data="chartData" :options="chartOptions" class="h-[30rem]"/>
      </div>
    
    </template>
  </Card>

</template>

<script setup lang="ts">
const client = useSanctumClient();
const { data } = await useAsyncData(
    'dashboard-chart_tahunini',
    async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // delay 2 detik
      return client('/api/dashboard/chart_tahunini')
    }
) as any

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

import { Colors } from 'chart.js';

const chartData = ref();
const chartOptions = ref();

const setChartData = () => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {      
        labels: data.value?.labels,
        datasets: data.value?.datasets
    };
};
const setChartOptions = () => {
    return {
        maintainAspectRatio: false,
        aspectRatio: 0.20,
        plugins: {
            // legend: {
            //     labels: true
            // },
            tooltip: {
                enabled: true
            },
            colors: {
              enabled: true
            }
        },
        scales: {
            x: {
              display: true
            },
            y: {
              display: true
            }
        }
    };
}
</script>
