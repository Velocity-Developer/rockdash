<template>
<Card class="shadow-sm">
    <template #header>
      <div class="px-4 py-2 flex items-center gap-1 font-bold">
        <Icon name="lucide:briefcase" /> Project saat ini
      </div>
    </template>
    <template #content>
      {{ chartData }}
      <Chart type="doughnut" :data="chartData" :options="chartOptions" class="h-[30rem]"/>
      
    </template>
  </Card>
</template>

<script setup lang="ts">
const client = useSanctumClient();

const chartData = ref();
const chartOptions = ref(null as any);

const setChartData = async () => {
    try {
      const res = await client('/api/dashboard/chart_project_saat_ini_webdeveloper') as any
      
      return {
          labels: res.labels,
          datasets: [
              {
                  data: res.datas,               
              }
          ]
      };
      
    } catch (error) {
      console.log(error);
    }

    
    
};

const setChartOptions = () => {
    return {
        plugins: {
            legend: {
                labels: {
                    cutout: '60%',
                    color: '#1f8378',
                }
            }
        }
    };
};

onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});
</script>
