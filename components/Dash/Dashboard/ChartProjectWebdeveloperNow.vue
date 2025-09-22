<template>
<Card class="shadow-sm">
    <template #header>
      <div class="px-4 py-2 flex items-center gap-1 font-bold">
        <Icon name="lucide:briefcase" /> Project saat ini
      </div>
    </template>
    <template #content>
      <Chart v-if="chartData" type="doughnut" :data="chartData" :options="chartOptions" class="h-[30rem]"/>
      <div v-else class="flex items-center justify-center h-[30rem]">
        <div class="text-center">
          <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 mx-auto mb-2" />
          <p class="text-gray-500">Memuat data chart...</p>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
const client = useSanctumClient();

const chartData = ref(null as any);
const chartOptions = ref(null as any);

const setChartData = async () => {
    try {
      const res = await client('/api/dashboard/chart_project_saat_ini_webdeveloper') as any
      
      return {
          labels: res.labels || [],
          datasets: [
              {
                  data: res.datas || [],
                  backgroundColor: [
                    '#14b8a6', // teal-500
                    '#f1c232',  
                    '#3d85c6', 
                    '#e06666', 
                    '#f59e0b',
                    '#ef4444', 
                    '#10b981', 
                  ],
                  borderWidth: 2,
                  borderColor: '#ffffff',
              }
          ]
      };
      
    } catch (error) {
      console.error('Error loading chart data:', error);
      // Return fallback data
      return {
          labels: ['No Data'],
          datasets: [
              {
                  data: [1],
                  backgroundColor: ['#e5e7eb'],
                  borderWidth: 2,
                  borderColor: '#ffffff',
              }
          ]
      };
    }
};

const setChartOptions = () => {
    return {
        cutout: '60%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                // display: false,
                position: 'bottom',
                labels: {
                    color: '#374151',
                    usePointStyle: true,
                    padding: 20,
                }
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#374151',
                borderWidth: 1,
            }
        }
    };
};

onMounted(async () => {
  chartOptions.value = setChartOptions();
  chartData.value = await setChartData();
});
</script>
