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
const userChartData = ref();
const userChartOptions = ref();

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

const setUserChartData = () => {
    if (!data.value?.data_user_details) return null;
    
    const items = data.value.data_user_details;
    const userTotals = data.value.data_user || [];

    // Get unique users and categories
    const users = Array.from(new Set(items.map((item: any) => item.user_name))).sort();
    const categories = Array.from(new Set(items.map((item: any) => item.category_name))).sort();
    
    const colors = [
        '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
        '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#14b8a6'
    ];
    
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const datasets = categories.map((cat: any, index: number) => {
        const color = colors[index % colors.length] || '#000000';
        return {
            type: 'line',
            label: cat,
            backgroundColor: (context: any) => {
                const chart = context.chart;
                const {ctx, chartArea} = chart;
                if (!chartArea) return null;
                
                const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                gradient.addColorStop(0, hexToRgba(color, 0));
                gradient.addColorStop(1, hexToRgba(color, 0.5));
                return gradient;
            },
            borderColor: color,
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            yAxisID: 'y',
            data: users.map((user: any) => {
                const item = items.find((i: any) => i.user_name === user && i.category_name === cat);
                return item ? Number(item.avg_minutes).toFixed(1) : 0;
            })
        };
    });

    // Add Total Journal Count on Secondary Axis
    datasets.push({
        type: 'line',
        label: 'Total Jurnal',
        backgroundColor: () => '#64748b', // Slate-500
        borderColor: '#64748b',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
        data: users.map((user: any) => {
            const item = userTotals.find((i: any) => i.user_name === user);
            return item ? item.total_journal : 0;
        })
    });

    return {
        labels: users,
        datasets
    };
};

const setUserLineChartOptions = () => {
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
            },
            tooltip: {
                mode: 'index',
                intersect: false
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

watch(data, () => {
    chartData.value = setChartData();
    userChartData.value = setUserChartData();
}, { deep: true });

const uniqueUsers = computed(() => {
    if (!data.value?.data_user_details) return [];
    const users = new Set(data.value.data_user_details.map((item: any) => item.user_name));
    return Array.from(users).sort();
});

const pivotData = computed(() => {
    if (!data.value?.data_user_details) return [];
    
    const rows = {} as any;
    
    // Initialize rows for all categories
    data.value.data_user_details.forEach((item: any) => {
        if (!rows[item.category_name]) {
            rows[item.category_name] = { category: item.category_name };
        }
        rows[item.category_name][item.user_name] = {
            avg: item.avg_minutes,
            total: item.total_journal
        };
    });
    
    return Object.values(rows);
});

// Force refresh check
onMounted(() => {
    console.log('Tim Support Rangkuman Loaded');
    chartOptions.value = setChartOptions();
    userChartOptions.value = setUserLineChartOptions();
    chartData.value = setChartData();
    userChartData.value = setUserChartData();
});
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
                <Column field="total_journal" sortable header="Total"></Column>
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

      <div class="col-span-4 mt-6 text-xl md:text-2xl" v-if="isPermissions('timsupport-journal-perform-tim')">
        Performa Tim Support
      </div>

      <Card class="col-span-4" v-if="isPermissions('timsupport-journal-perform-tim')">
        <template #header>
          <div class="flex pt-4 px-4 justify-start items-center gap-2">
            <Icon name="lucide:users" />
            <span class="text-sm">Response Time per User (Pivot)</span>
          </div>
        </template>
        <template #content>
            <div v-if="pivotData && pivotData.length > 0">
              <DataTable 
                :value="pivotData" 
                class="text-sm" 
                stripedRows
                scrollable 
                scrollHeight="600px"
              >
                <Column field="category" header="Kategori" frozen style="min-width: 200px"></Column>
                <Column v-for="user in uniqueUsers" :key="String(user)" :field="String(user)" :header="String(user)">
                  <template #body="slotProps">
                    <div v-if="slotProps.data[String(user)]" class="flex flex-col">
                        <span class="font-bold">{{ Number(slotProps.data[String(user)].avg).toFixed(1) }} m</span>
                        <span class="text-xs text-muted-foreground">{{ slotProps.data[String(user)].total }} Jurnal</span>
                    </div>
                    <span v-else>-</span>
                  </template>
                </Column>
              </DataTable>
            </div>
            <div v-else class="flex justify-center items-center gap-2 p-4 opacity-50 text-sm">
              <Icon name="lucide:clock-fading" /> Belum ada data
            </div>
        </template>
      </Card>
      
      <Card class="col-span-4" v-if="isPermissions('timsupport-journal-perform-tim')">
        <template #header>
          <div class="flex pt-4 px-4 justify-start items-center gap-2">
            <Icon name="lucide:users" />
            <span class="text-sm">Grafik Response Time per User</span>
          </div>
        </template>
        <template #content>
            <div class="h-[400px] p-2">
                <Chart v-if="userChartData" type="bar" :data="userChartData" :options="userChartOptions" class="h-full w-full" />
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
