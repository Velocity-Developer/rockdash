<template>
<Card class="shadow-sm">
    <template #header>
      <div class="px-4 py-2 flex items-center gap-1 font-bold">
        <Icon name="lucide:briefcase" /> Project saat ini
      </div>
    </template>
    <template #content>
        <div v-if="meterData" class="">
            <MeterGroup :value="meterData" labelPosition="start">
                <template #label="{ value }">
                    <div class="flex flex-wrap gap-4">
                        <template v-for="(val, index) of value" :key="index">
                            <Card class="flex-1 border border-surface shadow-none">
                                <template #content>
                                    <div class="flex justify-between gap-8">
                                        <div class="flex flex-col gap-1">
                                            <span class="text-surface-500 dark:text-surface-400 text-sm">{{ val.label }}</span>
                                            <span class="font-bold text-lg">{{ val.value }}%</span>
                                        </div>
                                        <span class="w-8 h-8 rounded-full inline-flex justify-center items-center text-center" :style="{ backgroundColor: `${val.color1}`, color: '#ffffff' }">
                                            <Icon name="lucide:rocket" />
                                        </span>
                                    </div>
                                </template>
                            </Card>
                        </template>
                    </div>
                </template>
                <template #meter="slotProps">
                    <span :class="slotProps.class" :style="{ background: `linear-gradient(to right, ${slotProps.value.color1}, ${slotProps.value.color2})`, width: slotProps.size }" />
                </template>
                <template #start="{ totalPercent }">
                    <div class="flex justify-between relative text-sm">
                        <span>Total</span>
                        <!-- <span :style="{ width: totalPercent + '%' }" class="absolute text-right">{{ totalPercent }}%</span> -->
                        <span class="font-medium">{{ totalProjects }} Project</span>
                    </div>
                </template>
            </MeterGroup>
        </div>
        <div v-else class="flex items-center justify-center h-[20rem]">
            <div class="text-center">
                <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 mx-auto mb-2" />
                <p class="text-gray-500">Memuat data project...</p>
            </div>
        </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import MeterGroup from 'primevue/metergroup';

const client = useSanctumClient();

const meterData = ref(null as any);
const totalProjects = ref(0);

const loadMeterData = async () => {
    try {
      const res = await client('/api/dashboard/chart_project_saat_ini_webdeveloper') as any
      
      // Set meter data dari API
      setMeterData(res);
      
    } catch (error) {
      console.error('Error loading meter data:', error);
      // Set fallback data
      setMeterData({
        labels: ['No Data'],
        datas: [1]
      });
    }
};



// Fungsi untuk mengatur data MeterGroup dari API
const setMeterData = (apiData: any) => {
  if (!apiData || !apiData.labels || !apiData.datas) {
    meterData.value = [];
    totalProjects.value = 0;
    return;
  }
  
  const colors = [
    { color1: '#14b8a6', color2: '#0d9488', icon: 'pi pi-briefcase' },
    { color1: '#f1c232', color2: '#d4a017', icon: 'pi pi-folder' },
    { color1: '#3d85c6', color2: '#2563eb', icon: 'pi pi-file' },
    { color1: '#e06666', color2: '#dc2626', icon: 'pi pi-clock' },
    { color1: '#f59e0b', color2: '#d97706', icon: 'pi pi-star' },
    { color1: '#ef4444', color2: '#b91c1c', icon: 'pi pi-exclamation-triangle' },
    { color1: '#10b981', color2: '#059669', icon: 'pi pi-check-circle' }
  ];
  
  const total = apiData.datas.reduce((sum: number, val: number) => sum + val, 0);
  totalProjects.value = total;
  
  meterData.value = apiData.labels.map((label: string, index: number) => {
    const value = apiData.datas[index] || 0;
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    const colorConfig = colors[index % colors.length];
    
    return {
      label: label,
      value: percentage,
      color1: colorConfig.color1,
      color2: colorConfig.color2,
      icon: colorConfig.icon
    };
  });
};

onMounted(async () => {
  await loadMeterData();
});

import { ref } from "vue";
</script>
