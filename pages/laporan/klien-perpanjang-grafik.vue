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
                  <Button
                    link
                    size="small"
                    class="!px-0"
                    @click="openDetailDialog(slotProps.data, 'perpanjang')"
                  >
                    {{ formatMoney(slotProps.data.perpanjang || 0,'false',0) }}
                  </Button>
              </template>
            </Column>
            <Column field="tidak_perpanjang" header="Tidak Perpanjang">
              <template #body="slotProps">
                  <Button
                    link
                    size="small"
                    class="!px-0"
                    @click="openDetailDialog(slotProps.data, 'tidak_perpanjang')"
                  >
                    {{ formatMoney(slotProps.data.tidak_perpanjang || 0,'false',0) }}
                  </Button>
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
          <div class="flex justify-start items-center gap-2 px-6 pt-4 text-sky-600 dark:text-sky-100">
            <Icon name="lucide:calendar"/> <span>{{ item.month+' '+item.year || '-' }}</span>
          </div>
        </template>
        <template #content class="overflow-x-auto">
          <table class="table w-full text-sm">
            <tbody>
              <tr v-for="itemdetail in item.detail" :key="itemdetail.key" class="odd:bg-gray-50 dark:odd:bg-slate-900">
                <td class="px-3 py-1 border-t dark:border-slate-700">{{ itemdetail.label }}</td>
                <td class="px-3 py-1 border-t dark:border-slate-700 text-right font-bold">
                  <Button
                    link
                    size="small"
                    class="!px-0 !py-0 font-bold !text-slate-800 dark:!text-slate-100 hover:underline"
                    @click="openRincianDialog(item, itemdetail.key, itemdetail.label)"
                    severity="contrast"
                  >
                    {{ itemdetail.key=='ratio_perpanjang_webhost'?itemdetail.value+' %':formatMoney(itemdetail.value,'false',0) }}
                  </Button>
                </td>
              </tr>
              <tr>
                <td class="px-3 pb-1 pt-3 gap-3 border-t dark:border-slate-700 text-blue-500" colspan="2">
                  <Icon name="lucide:check-line"/> Perpanjang masuk
                </td>
              </tr>
              <tr v-for="itemdetail in item.detail_perpanjang" :key="itemdetail.key" class="odd:bg-gray-50 dark:odd:bg-slate-900">
                <td class="px-3 py-1 border-t dark:border-slate-700">{{ itemdetail.label }}</td>
                <td class="px-3 py-1 border-t dark:border-slate-700 text-right font-bold">
                  <Button
                    link
                    size="small"
                    class="!px-0 !py-0 font-bold !text-slate-800 dark:!text-slate-100 hover:underline"
                    @click="openRincianDialog(item, itemdetail.key, itemdetail.label)"
                    severity="contrast"
                  >
                    {{ formatMoney(itemdetail.value,'false',0) }}
                  </Button>
                </td>
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
              <thead v-if="data.data && data.data.length">
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
                    <Button
                      link
                      size="small"
                      class="!px-0 !py-0"
                      @click="openRincianDialog(item, getRincianKeyFromLabel(String(key)), String(key))"
                      severity="contrast"
                    >
                      {{ key === 'Ratio Perpanjang (%)' ? value+' %' : formatMoney(value,'false',0) }}
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </Card>

    </div>

    <Dialog
      v-model:visible="detailDialog.visible"
      modal
      :style="{ width: '90rem' }"
      :breakpoints="{ '1199px': '90vw', '575px': '96vw' }"
    >
      <template #header>
        <div class="flex items-center justify-between gap-3 w-full">
          <span>{{ detailDialog.header }}</span>
          <Button
            size="small"
            severity="success"
            :disabled="detailDialog.loading || !detailDialog.rows.length"
            @click="exportDetailToExcel"
          >
            <Icon name="lucide:download" />
            Export Excel
          </Button>
        </div>
      </template>
      <DataTable
        :value="detailDialog.rows"
        :loading="detailDialog.loading"
        class="text-xs"
        stripedRows
        scrollable
        scrollHeight="75vh"
        paginator :rows="50" :rowsPerPageOptions="[25, 50, 100]"
        @page="onPage"
      >
        <Column header="#" headerStyle="width:3rem">
          <template #body="slotProps">
              {{ first + slotProps.index + Number(1) }}
          </template>
        </Column>
        <!-- <Column field="id_webhost" header="ID Webhost" /> -->
        <Column field="nama_web" header="Nama Web" />
        <Column field="tgl_mulai" header="Tgl Mulai">
          <template #body="slotProps">
            {{ slotProps.data.tgl_mulai || '-' }}
          </template>
        </Column>
        <Column field="tgl_masuk" header="Tgl Masuk">
          <template #body="slotProps">
            {{ slotProps.data.tgl_masuk || '-' }}
          </template>
        </Column>
        <Column field="expirydate" header="Expiry Date">
          <template #body="slotProps">
            {{ slotProps.data.expirydate || '-' }}
          </template>
        </Column>
        <Column field="whmcs_status" header="Status WHMCS">
          <template #body="slotProps">
            {{ slotProps.data.whmcs_status || '-' }}
          </template>
        </Column>
        <Column field="dibayar" header="Dibayar">
          <template #body="slotProps">
            {{ formatMoney(slotProps.data.dibayar || 0,'false',0) }}
          </template>
        </Column>
        <template #empty>
          <div class="flex justify-center items-center">
            Oops, Tidak ada data disini..
          </div>
        </template>
      </DataTable>
    </Dialog>
    
  </div>

  <DashLoader :loading="loading"/>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx'

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
const rincianKeyMap = {
  'Total Webhost': 'total_webhost',
  'Webhost Perpanjang': 'webhost_perpanjang',
  'Webhost Tidak Perpanjang': 'webhost_tidak_perpanjang',
  'Ratio Perpanjang (%)': 'ratio_perpanjang_webhost',
} as Record<string, string>
const detailDialog = reactive({
  visible: false,
  loading: false,
  header: 'Detail Data',
  rows: [],
} as any)

const loading = ref(false);
const data = ref({ year: null, months: [], data: [] } as any);
const buildMonths = () => {
  const selectedYear = filters.tahun ? dayjs(filters.tahun).year() : dayjs().year()
  const currentYear = dayjs().year()
  const maxMonth = selectedYear === currentYear ? dayjs().month() + 1 : 12

  return Array.from({ length: maxMonth }, (_, index) => {
    const monthNumber = index + 1
    return {
      month: monthNumber,
      name: dayjs(`${selectedYear}-${String(monthNumber).padStart(2, '0')}-01`).format('MMMM'),
      year: selectedYear,
    }
  })
}

const getData = async () => {
  loading.value = true;
  updateRouteParams()

  try {
    const selectedYear = filters.tahun ? dayjs(filters.tahun).format('YYYY') : dayjs().format('YYYY')
    const months = buildMonths()

    const responses = await Promise.all(
      months.map((item) =>
        client('/api/laporan/klien_perpanjang_grafik', {
          params: {
            tahun: selectedYear,
            bulan: item.month,
          },
        })
      )
    )

    data.value = {
      year: Number(selectedYear),
      months,
      data: responses.sort((a: any, b: any) => (a.month_number || 0) - (b.month_number || 0)),
    }
    loading.value = false;

    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
    
    
  } catch (error) {
    const er = useSanctumError(error);
    loading.value = false;
  }

  loading.value = false;
}

const openDetailDialog = async (item: any, jenis: 'perpanjang' | 'tidak_perpanjang') => {
  first.value = 0
  detailDialog.visible = true
  detailDialog.loading = true
  detailDialog.rows = []
  detailDialog.header = `${jenis === 'perpanjang' ? 'Perpanjang' : 'Tidak Perpanjang'} - ${item.month} ${item.year}`

  try {
    const response = await client('/api/laporan/klien_perpanjang_grafik_data', {
      params: {
        tahun: item.year,
        bulan: item.month_number,
        jenis,
      },
    }) as any

    detailDialog.rows = response.data || []
  } catch (error) {
    const er = useSanctumError(error)
    detailDialog.rows = []
  } finally {
    detailDialog.loading = false
  }
}

const getRincianKeyFromLabel = (label: string) => rincianKeyMap[label] || ''

const openRincianDialog = async (item: any, detailKey: string, label: string) => {
  if (!detailKey) {
    return
  }

  first.value = 0
  detailDialog.visible = true
  detailDialog.loading = true
  detailDialog.rows = []
  detailDialog.header = `${label} - ${item.month} ${item.year}`

  try {
    const response = await client('/api/laporan/klien_perpanjang_grafik_data', {
      params: {
        tahun: item.year,
        bulan: item.month_number,
        jenis: 'detail',
        detail_key: detailKey,
      },
    }) as any

    detailDialog.rows = response.data || []
  } catch (error) {
    const er = useSanctumError(error)
    detailDialog.rows = []
  } finally {
    detailDialog.loading = false
  }
}

const exportDetailToExcel = () => {
  if (!detailDialog.rows?.length) {
    return
  }

  const exportData = detailDialog.rows.map((item: any, index: number) => ({
    No: index + 1,
    'Nama Web': item.nama_web || '-',
    'Tgl Mulai': item.tgl_mulai || '-',
    'Tgl Masuk': item.tgl_masuk || '-',
    'Expiry Date': item.expirydate || '-',
    'Status WHMCS': item.whmcs_status || '-',
    Dibayar: item.dibayar || 0,
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(exportData)

  ws['!cols'] = [
    { wch: 6 },
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 14 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Detail')

  const fileName = `Klien_Perpanjang_Grafik_${detailDialog.header.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`
  XLSX.writeFile(wb, fileName)
}

onMounted(()=>{
  getData()
})

const setChartData = () =>  {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: (data.value.data || []).map((item: any) => item.month),
        datasets: [
            {
                type: 'bar',
                label: 'Perpanjang',
                backgroundColor: documentStyle.getPropertyValue('--p-teal-500'),
                data: (data.value.data || []).map((item: any) => item.perpanjang)
            },
            {
                type: 'bar',
                label: 'Tidak Perpanjang',
                backgroundColor: documentStyle.getPropertyValue('--p-orange-200'),
                data: (data.value.data || []).map((item: any) => item.tidak_perpanjang)
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

const first = ref(0);
const onPage = (event: any) => {
  first.value = event.first
}
</script>
