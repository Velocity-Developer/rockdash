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
      
    </template>
  </Card>
  
  <Card v-if="dataExpiredWHMCS" class="mt-4">
    <template #header>
      <div class="px-6 pt-4 font-bold">
        Layanan Expired : {{ theBulan }}
      </div>
    </template>
    <template #content>
      
      <div class="flex aligns-center justify-end mb-3">
        <div class=" border rounded py-2 px-4 w-[150px] border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950">
          <div class="text-xs">Total</div>
          <div class="text-end font-bold">{{ dataExpiredWHMCS.length }}</div>
        </div>
      </div>

      <DataTable 
      :value="dataExpiredWHMCS" 
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
        <Column field="domain" header="Domain">
          <template #body="slotProps">
            <div class="hover:underline cursor-pointer">
              <span v-if="slotProps.data.domain" :class="isToday(slotProps.data.domain.expirydate)?'text-green-600':''" @click="openDialogPerpanjang(slotProps.data,'Detail '+slotProps.data.domain?.domain)">              
                {{ slotProps.data.domain?.domain }}
              </span>            
              <span v-if="!slotProps.data.domain && slotProps.data.hosting" :class="isToday(slotProps.data.hosting.nextduedate)?'text-green-600':''" @click="openDialogPerpanjang(slotProps.data,'Detail '+slotProps.data.hosting?.domain)">              
                {{ slotProps.data.hosting?.domain }}
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
        <Column field="hosting.nextduedate" :sortable="true" header="Expiry Date Hosting">
          <template #body="slotProps">
            <span v-if="slotProps.data.hosting" :class="isToday(slotProps.data.hosting.nextduedate)?'text-green-600':''">              
              {{ slotProps.data.hosting.nextduedate }}
            </span>
          </template>
        </Column>
        <Column field="hosting.package_name" :sortable="true" header="Hosting">
          <template #body="slotProps">
            <span v-if="slotProps.data.hosting" :class="isToday(slotProps.data.hosting.nextduedate)?'text-green-600':''">              
              {{ slotProps.data.hosting.package_name }}
            </span>
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
    <div class="space-y-5">
        <template v-if="dataDialogPerpanjang.domain">
          <div class="border p-5 rounded">
            <div class="flex items-center gap-2 mb-4 text-blue-600">
              <Icon name="lucide:globe" /> Domain
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3">
              <template v-for="(d, i) in dataDialogPerpanjang.domain" :key="i">
                <div v-if="i !== 'id'">
                  {{ i }} : <span class="font-bold"> {{ d }} </span>
                </div>
              </template>
            </div>
          </div>
        </template>

        <template v-if="dataDialogPerpanjang.hosting">
          <div class="border p-5 rounded">
            <div class="flex items-center gap-2 mb-4 text-emerald-600">
              <Icon name="lucide:database" /> Hosting
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3">
              <template v-for="(d, i) in dataDialogPerpanjang.hosting" :key="i">
                <div v-if="i !== 'id'">
                  {{ i }} : <span class="font-bold"> {{ d }} </span>
                </div>
              </template>
            </div>
          </div>
        </template>
    </div>
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

const { data: dataExpiredWHMCS, status: statusDataExpiredWHMCS} = await useAsyncData(
    'expired-whmcs-month-'+theBulan,
    () => client('/api/whmcs-custom/expired-month',{
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
</script>
