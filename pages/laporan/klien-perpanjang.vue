<template>

  <div class="flex flex-col md:flex-row md:items-end gap-1 mb-3">
    <div>
      <label class="mb-1 block text-xs">Bulan :</label>
      <DatePicker v-model="filter.bulan" view="month" dateFormat="mm/yy" size="small"/>
    </div>
    <div>
      <Button @click="getData">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:search"/>
      </Button>
    </div>
  </div>
  
  <Card>
    <template #content>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border border-b">
              <th class="px-3 py-2 text-left">Jenis</th>
              <th class="px-3 py-2 text-left">Total</th>
              <th class="px-3 py-2 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="data.data" v-for="item in data.data" :key="item.jenis" class="border border-b">
              <td class="px-3 py-2 text-left">
                <span class="cursor-pointer hover:underline" @click="openDialog(item,item.label)">
                {{ item.label }}
                </span>
              </td>
              <td class="px-3 py-2 text-left">{{ item.total }}</td>
              <td class="px-3 py-2 text-right">{{ formatMoney(item.nominal,'Rp',0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </template>
  </Card>
  
  <Card v-if="dataExpiredWHMCS" class="mt-4">
    <template #header>      
      <div class="md:flex md:items-start md:justify-between gap-2 px-6 pt-4">
        <div>
          <div class="font-bold mb-1">
            Layanan Expired : {{ theBulan }}
          </div>
          <div class="gap-1 flex items-center">
            <Button @click="reSyncDomainHosting" :loading="loadingReSync" size="small">
              <Icon name="lucide:globe" :class="loadingReSync ? 'animate-spin' : ''"/>
              Re-Sync WHMCS
            </Button>
            <Button @click="refreshDataExpiredWHMCS()" :loading="statusDataExpiredWHMCS==='pending'" size="small">
              <Icon name="lucide:refresh-cw" :class="statusDataExpiredWHMCS==='pending' ? 'animate-spin' : ''"/>
            </Button>
          </div>
        </div>

        <div class="overflow-x-scroll md:overflow-auto">
          <div class="flex items-center md:justify-end mt-3 md:mt-0 gap-2">
            <div class=" border rounded py-2 px-4 w-[150px] border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 hover:shadow-md">
              <div class="text-xs">Total</div>
              <div class="text-end font-bold">{{ dataExpiredWHMCS.total }}</div>
            </div>
            <div class=" border rounded py-2 px-4 w-[150px] border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 hover:shadow-md">
              <div class="text-xs">Total Hosting</div>
              <div class="text-end font-bold">{{ dataExpiredWHMCS.total_hosting }}</div>
            </div>
            <div class=" border rounded py-2 px-4 w-[150px] border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 hover:shadow-md">
              <div class="text-xs">Total Domain</div>
              <div class="text-end font-bold">{{ dataExpiredWHMCS.total_domain }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #content>    

      <DataTable 
        :value="dataExpiredWHMCS.data" 
        size="small" class="text-sm" 
        stripedRows scrollHeight="70vh" scrollable 
        :loading="statusDataExpiredWHMCS === 'pending'"
        paginator :rows="25" :rowsPerPageOptions="[5, 10, 25, 50, 100]"
        @page="onPage"
      >
        <Column field="no" header="No">
          <template #body="slotProps">
            {{ first + slotProps.index + 1}}
          </template>
        </Column>
        <Column field="domain_name" header="Domain">
          <template #body="slotProps">
            <div class="hover:underline cursor-pointer">
              <span v-if="slotProps.data.domain" @click="openDialogPerpanjang(slotProps.data,'Detail '+slotProps.data.domain_name)">              
                {{ slotProps.data.domain_name }}
              </span>
              <span v-else-if="!slotProps.data.domain && slotProps.data.hosting" :class="isToday(slotProps.data.hosting.nextduedate)?'text-green-600':''" @click="openDialogPerpanjang(slotProps.data,'Detail '+slotProps.data.domain_name)">              
                {{ slotProps.data.domain_name }}
              </span>
            </div>
          </template>
        </Column>
        <Column field="domain.expirydate" :sortable="true" header="Expiry Date domain">
          <template #body="slotProps">
            <span v-if="slotProps.data.domain" :class="isToday(slotProps.data.domain.expirydate)?'text-green-600':''">              
              {{ slotProps.data.domain.expirydate }}
            </span>
          </template>
        </Column>
        <Column field="domain.status" sortable header="Status Domain">
          <template #body="slotProps">
            <Badge v-if="slotProps.data.domain" :severity="slotProps.data.domain.status === 'Active'?'success':slotProps.data.domain.status === 'Grace'?'warn':'contrast'">
              {{ slotProps.data.domain.status }}
            </Badge>
          </template>
        </Column>
        <Column field="hosting.nextduedate" sortable header="Expiry Date Hosting">
          <template #body="slotProps">
            <span v-if="slotProps.data.hosting" :class="isToday(slotProps.data.hosting.nextduedate)?'text-green-600':''">              
              {{ slotProps.data.hosting.nextduedate }}
            </span>
          </template>
        </Column>
        <Column field="hosting.package_name" sortable header="Hosting">
          <template #body="slotProps">
            <span v-if="slotProps.data.hosting" :class="isToday(slotProps.data.hosting.nextduedate)?'text-green-600':''">              
              {{ slotProps.data.hosting.package_name }}
            </span>
          </template>
        </Column>
        <Column field="status" sortable header="Status">
          <template #body="slotProps">
            <Badge :severity="slotProps.data.status?'success':'contrast'">
              {{ slotProps.data.status?'Perpanjang':'Tidak' }}
            </Badge>
          </template>
        </Column>
      </DataTable>

    </template>
  </Card>

  <Dialog v-model:visible="visibleDialog" modal :header="titleDialog" :style="{ width: '80rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    
    <template #header>
      <div class="flex justify-between items-center w-full">
        <span>{{ titleDialog }}</span>
        <Button 
          v-if="dataDialog && dataDialog.webhosts" 
          @click="exportToExcel" 
          size="small" 
          severity="danger"
          class="ml-4"
        >
          <Icon name="lucide:download" />
          Export Excel
        </Button>
      </div>
    </template>
   
    <div v-if="dataDialog && dataDialog.webhosts">
      <DataTable 
        :value="dataDialog.webhosts" 
        size="small" 
        class="text-sm" 
        stripedRows scrollHeight="72vh" 
        scrollable
        paginator :rows="25" :rowsPerPageOptions="[25, 50, 100, 250, 500]" 
      >
        <Column header="No" headerStyle="width:3rem">
          <template #body="slotProps">
            {{ slotProps.index + 1 }}
          </template>
        </Column>
        <Column field="nama_web" header="Nama Web">
          <template #body="slotProps">
            {{ slotProps.data.nama_web }}
          </template>
        </Column>
        <Column field="project" header="Riwayat">
          <template #body="slotProps">
            <table class="w-full">
              <tbody>
                <tr v-for="(item,index) in slotProps.data.cs_main_projects" :key="index">
                  <td class="px-3 py-2 text-left w-[20rem] border-b">{{ item.jenis }}</td>
                  <td class="px-3 py-2 text-left w-[8rem] border-x border-b">{{ item.tgl_masuk }}</td>
                  <td class="px-3 py-2 text-right border-b">{{ formatMoney(item.dibayar,'',0) }}</td>
                </tr>
              </tbody>
            </table>
          </template>
        </Column>
      </DataTable>
    </div>

  </Dialog>

  <Dialog v-model:visible="visibleDialogPerpanjang" modal :header="titleDialogPerpanjang" :style="{ width: '80rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <WhmcsDomainPreview v-if="dataDialogPerpanjang.domain" :id="dataDialogPerpanjang.domain.id"/>
    <WhmcsHostingPreview v-else="!dataDialogPerpanjang.domain && dataDialogPerpanjang.hosting" :id="dataDialogPerpanjang.hosting.id"/>
  </Dialog>

  <DashLoader :loading="loading"/>

</template>

<script setup lang="ts">
import * as XLSX from 'xlsx';

definePageMeta({
    title: 'Laporan Klien Perpanjang',
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const router = useRouter()

const filter = reactive({
    bulan: route.query.bulan
      ? dayjs(String(route.query.bulan)).toDate()
      : dayjs().toDate(),
} as any)
function updateRouteParams() {
  router.push({
    query: {       
      bulan: filter.bulan ?dayjs(filter.bulan).format('YYYY-MM'):null,
     },
  });
}

const first = ref(0);
const onPage = (event: any) => {
  first.value = event.first
}

const loading = ref(false);
const data = ref([] as any);
const getData = async () => {
  loading.value = true;
  updateRouteParams()

  try {
    const response = await client('/api/laporan/siklus_layanan',{
      params: {
        bulan: filter.bulan ?dayjs(filter.bulan).format('YYYY-MM'):null,
      },
    });
    data.value = response;
    loading.value = false;
  } catch (error) {
    const er = useSanctumError(error);
    loading.value = false;
  }

  loading.value = false;
}

onMounted(()=>{
  getData()
  reSyncDomainHosting()
})

const visibleDialog = ref(false);
const dataDialog = ref({} as any);
const titleDialog = ref('');
const openDialog = async (data = {} as any,title = '') => {
  visibleDialog.value = true;
  dataDialog.value = data;
  titleDialog.value = title;
}

const exportToExcel = () => {
  if (!dataDialog.value || !dataDialog.value.webhosts) {
    return;
  }

  // Prepare data for Excel export
  const excelData: any[] = [];
  
  // Add header row
  excelData.push(['No', 'Nama Web', 'Jenis Project', 'Tanggal Masuk', 'Nominal']);
  
  // Process each webhost and their projects
  dataDialog.value.webhosts.forEach((webhost: any, webhostIndex: number) => {
    if (webhost.cs_main_projects && webhost.cs_main_projects.length > 0) {
      webhost.cs_main_projects.forEach((project: any, projectIndex: number) => {
        excelData.push([
          projectIndex === 0 ? webhostIndex + 1 : '', // Show number only on first project
          projectIndex === 0 ? webhost.nama_web : '', // Show nama_web only on first project
          project.jenis,
          project.tgl_masuk,
          project.dibayar
        ]);
      });
    } else {
      // If no projects, still show the webhost
      excelData.push([
        webhostIndex + 1,
        webhost.nama_web,
        '-',
        '-',
        '-'
      ]);
    }
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },   // No
    { wch: 30 },  // Nama Web
    { wch: 25 },  // Jenis Project
    { wch: 15 },  // Tanggal Masuk
    { wch: 15 }   // Nominal
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Klien Perpanjang');

  // Generate filename with filter bulan
  const filename = `Klien_Perpanjang_${titleDialog.value.replace(/[^a-zA-Z0-9]/g, '_')}_${filter.bulan}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
}

const theBulan = computed(() => {
  return filter.bulan ?dayjs(filter.bulan).format('YYYY-MM'):null
});

const { data: dataExpiredWHMCS, status: statusDataExpiredWHMCS, refresh: refreshDataExpiredWHMCS} = await useAsyncData(
    'siklus_layanan_expired_whmcs-'+theBulan,
    () => client('/api/laporan/siklus_layanan_expired_whmcs',{
      params: {
        month: theBulan.value
      }
    }),
    {
      watch: [data],
    },
) as any

const isToday = (date: string) => {
  return dayjs(date).isSame(dayjs(), 'day')
}

const visibleDialogPerpanjang = ref(false);
const dataDialogPerpanjang = ref({} as any);
const titleDialogPerpanjang = ref('');
const openDialogPerpanjang = async (data = {} as any,title = '') => {
  visibleDialogPerpanjang.value = true;
  dataDialogPerpanjang.value = data;
  titleDialogPerpanjang.value = title;
}

const loadingReSync = ref(false);
const reSyncDomainHosting = async () => {
  loadingReSync.value = true;
  try {
    await client('/api/whmcs-custom/sync-domains-hostings',{
      params: {
        month: theBulan.value
      }
    });

    const newTheBulan = dayjs(theBulan.value).add(1, 'year').format('YYYY-MM');    
    await client('/api/whmcs-custom/sync-domains-hostings',{
      params: {
        month: newTheBulan
      }
    });
    refreshDataExpiredWHMCS()
  } catch (error) {
    const er = useSanctumError(error);
  } finally {
    loadingReSync.value = false;
  }
}

const isPerbarui = (dateE: any) => {
  const dateYear = dayjs(dateE).format('YYYY').toString()
  const bulanYear = dayjs(theBulan.value).format('YYYY').toString()
  return Number(dateYear)>Number(bulanYear);
}
</script>
