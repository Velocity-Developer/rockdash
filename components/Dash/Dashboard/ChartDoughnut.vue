<template>
  
  <Card class="md:h-[100%] dark:bg-zinc-800">
    <template #content>

      <div>
        <div class="text-sm dark:text-zinc-400 mb-4">Project Hari ini</div>
      </div>
      <div>
        <Chart type="doughnut" :data="chartData" :options="chartOptions" class="h-[400px]" />
      </div>
    
    </template>
  </Card>

</template>

<script setup lang="ts">
const client = useSanctumClient();
const { data } = await useAsyncData(
    'dashboard-chart_hariini',
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // delay 1 detik
      return client('/api/dashboard/chart_hariini')
    }
)

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

const chartData = ref();
const chartOptions = ref();
const setChartData = () => {
    const documentStyle = getComputedStyle(document.body);

    return {      
        labels: data.value?.labels,
        datasets: [{
            label: 'Project',
            data: data.value?.data,
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)'
            ],
            hoverOffset: 4
        }]
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        plugins: {
            legend: {
                labels: {
                    cutout: '60%',
                    color: textColor
                }
            }
        }
    };
};
</script>
