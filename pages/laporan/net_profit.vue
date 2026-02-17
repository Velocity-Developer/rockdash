<template>
  <div class="space-y-6">

    <div class="flex flex-col md:flex-row md:items-end gap-1 mb-3">
      <div>
        <label class="mb-1 block text-xs">Dari :</label>
        <DatePicker v-model="filter.bulan_dari" view="month" dateFormat="mm/yy" size="small"/>
      </div>
      <div>
        <label class="mb-1 block text-xs">Sampai :</label>
        <DatePicker v-model="filter.bulan_sampai" view="month" dateFormat="mm/yy" size="small"/>
      </div>
      <div>
        <Button @click="getData">
          <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin"/>
          <Icon v-else name="lucide:search"/>
        </Button>
      </div>
    </div>

    <Card>
      <template #header>
        <div class="px-5 pt-3 font-bold">
          Pembuatan
        </div>
      </template>
      <template #content>
      <DataTable :value="data.data" class="text-xs mt-4" size="small" stripedRows scrollable>
        <Column field="label" header="Bulan">
          <template #body="slotProps">
            <span @click="openOrderPreview(slotProps.data)" class="cursor-pointer">
            {{ slotProps.data.label }}
            </span>
          </template>
        </Column>
        <Column field="biaya_iklan" header="Biaya Iklan">
          <template #body="slotProps">
            {{ formatMoney(slotProps.data.biaya_iklan,'',0) }}
          </template>
        </Column>
        <Column field="chat_ads" header="Chat Ads">
          <template #body="slotProps">
            <span 
              @click="openChatPreview(slotProps.data)" 
              class="cursor-pointer text-blue-600 hover:text-blue-800 underline decoration-dotted"
            >
              {{ slotProps.data.chat_ads }}
            </span>
          </template>
        </Column>
        <Column field="order" header="Order">
          <template #body="slotProps">
            <span 
              @click="openOrderPreview(slotProps.data)" 
              class="cursor-pointer text-blue-600 hover:text-blue-800 underline decoration-dotted"
            >
              {{ slotProps.data.order }}
            </span>
          </template>
        </Column>
        <Column field="persen_order" header="%Order">
          <template #body="slotProps">
            {{ slotProps.data.persen_order }}
          </template>
        </Column>
        <Column field="omzet" header="Omzet">
          <template #body="slotProps">
            {{ formatMoney(slotProps.data.omzet,'',0) }}
          </template>
        </Column>
        <Column field="harga_domain" header="Harga Domain">
          <template #body="slotProps">
            {{ formatMoney(slotProps.data.harga_domain,'',0) }}
          </template>
        </Column>
        <Column field="biaya_domain" header="Biaya Domain">
          <template #body="slotProps">
            {{ formatMoney(slotProps.data.biaya_domain,'',0) }}
          </template>
        </Column>
        <Column field="profit_kotor" header="Profit Kotor">
          <template #body="slotProps">
            {{ formatMoney(slotProps.data.profit_kotor,'',0) }}
          </template>
        </Column>
        <Column field="profit_kotor" header="Profit Kotor /Order">
          <template #body="slotProps">
            {{ formatMoney(slotProps.data.profit_kotor_order,'',0) }}
          </template>
        </Column>
        <Column field="profit_kotor" header="Net Profit">
          <template #body="slotProps">
            {{ formatMoney(slotProps.data.net_profit,'',0) }}
          </template>
        </Column>
        <Column field="profit_kotor" header="Biaya / Order">
          <template #body="slotProps">
            {{ formatMoney(slotProps.data.biaya_per_order,'',0) }}
          </template>
        </Column>
        <Column field="act" header="" class="text-right">
          <template #body="slotProps">
            <ButtonGroup>
              <Button size="small" severity="info" @click="openChatPreview(slotProps.data)">
                <Icon name="lucide:message-circle" />
              </Button>
              <Button size="small" severity="contrast" @click="openOrderPreview(slotProps.data)">
                <Icon name="lucide:shopping-cart" />
              </Button>
              <Button size="small" severity="success" @click="exportExcel(slotProps.data)">
                <Icon name="lucide:download" />
              </Button>
            </ButtonGroup>
          </template>
        </Column>
      </DataTable>
      
      </template>
    </Card>

      <Dialog v-model:visible="dialogOrderPreview" modal header="Detail Projects" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <DataTable :value="selectedOrderPreview.projects" class="text-xs mt-4" size="small" stripedRows scrollable>
          <Column field="no" header="#">
            <template #body="slotProps">
              {{ Number(slotProps.index) + 1 }}
            </template>
          </Column>
          <Column field="webhost.nama_web" header="Web"></Column>
          <Column field="biaya" header="Biaya">
            <template #body="slotProps">
              {{ formatMoney(slotProps.data.biaya,'',0) }}
            </template>
          </Column>
          <Column field="dibayar" header="Dibayar">
            <template #body="slotProps">
              {{ formatMoney(slotProps.data.dibayar,'',0) }}
            </template>
          </Column>
          <Column field="waktu_chat_pertama" header="Chat pertama"></Column>
          <Column field="tgl_masuk" header="Tgl Masuk"></Column>
        </DataTable>
      </Dialog>

      <Dialog v-model:visible="dialogChatPreview" modal header="Detail Chat" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <DataTable :value="selectedChatPreview.chat_details" class="text-xs mt-4" size="small" stripedRows scrollable>
          <Column field="no" header="#">
            <template #body="slotProps">
              {{ Number(slotProps.index) + 1 }}
            </template>
          </Column>
          <Column field="chat_pertama" header="Tanggal">
            <template #body="slotProps">
              {{ dayjs(slotProps.data.chat_pertama).format('DD-MM-YYYY HH:mm') }}
            </template>
          </Column>
          <Column field="alasan" header="Alasan"></Column>
          <Column field="via" header="Via"></Column>
        </DataTable>
      </Dialog>

      <Card>
        <template #header>
          <div class="px-5 pt-3 font-bold">
            Pembuatan dari 
          </div>
        </template>
        <template #content>
          <NetProfitPembuatan />
        </template>
      </Card>

  </div>
  <DashLoader :loading="loading"/>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Net Profit',
    page_key:'net_profit',
    development: true
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
import * as XLSX from 'xlsx'
const dayjs = useDayjs()
const route = useRoute()
const router = useRouter()

const filter = reactive({
  bulan_dari: route.query.dari
    ? dayjs(route.query.dari as string).toDate()
    : dayjs().subtract(6, 'month').toDate(),

  bulan_sampai: route.query.sampai
    ? dayjs(route.query.sampai as string).toDate()
    : dayjs().toDate(),
});

function updateRouteParams() {
  router.push({
    query: { 
      dari: dayjs(filter.bulan_dari).format('YYYY-MM').toString(),
      sampai: dayjs(filter.bulan_sampai).format('YYYY-MM').toString(),
     },
  });
}

const loading = ref(false);
const data = ref([] as any);
const getData = async () => {
  loading.value = true;
  
  try {
    const response = await client('/api/laporan/net_profit',{
      params: {
        bulan_dari: dayjs(filter.bulan_dari).utc().local().format('YYYY-MM'),
        bulan_sampai: dayjs(filter.bulan_sampai).utc().local().format('YYYY-MM'),
      },
    });
    data.value = response;
    loading.value = false;
  } catch (error) {
    const er = useSanctumError(error);
    loading.value = false;
  }

  updateRouteParams()
  loading.value = false;
}

onMounted(() => {
  getData()
})

const dialogOrderPreview = ref(false)
const selectedOrderPreview = ref({} as any)
const openOrderPreview = (data: any) => {
  dialogOrderPreview.value = true
  selectedOrderPreview.value = data
}

const dialogChatPreview = ref(false)
const selectedChatPreview = ref({} as any)
const openChatPreview = (row: any) => {
  dialogChatPreview.value = true
  selectedChatPreview.value = row
}

const exportExcel = (row: any) => {
  if (!row) {
    return
  }

  const summaryRows = [
    ['Bulan', row.label ?? ''],
    ['Biaya Iklan', row.biaya_iklan ?? 0],
    ['Chat Ads', row.chat_ads ?? 0],
    ['Order', row.order ?? 0],
    ['% Order', row.persen_order ?? 0],
    ['Omzet', row.omzet ?? 0],
    ['Harga Domain', row.harga_domain ?? 0],
    ['Biaya Domain', row.biaya_domain ?? 0],
    ['Profit Kotor', row.profit_kotor ?? 0],
    ['Profit Kotor / Order', row.profit_kotor_order ?? 0],
    ['Net Profit', row.net_profit ?? 0],
    ['Biaya / Order', row.biaya_per_order ?? 0],
  ]

  const wb = XLSX.utils.book_new()
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan')

  if (Array.isArray(row.projects) && row.projects.length > 0) {
    const projectsData = row.projects.map((item: any, index: number) => ({
      No: index + 1,
      Web: item.webhost?.nama_web ?? '',
      Biaya: item.biaya ?? 0,
      Dibayar: item.dibayar ?? 0,
      'Chat Pertama': item.waktu_chat_pertama ?? '',
      'Tgl Masuk': item.tgl_masuk ?? '',
    }))
    const wsProjects = XLSX.utils.json_to_sheet(projectsData)
    XLSX.utils.book_append_sheet(wb, wsProjects, 'Detail Order')
  }

  if (Array.isArray(row.chat_details) && row.chat_details.length > 0) {
    const chatData = row.chat_details.map((item: any, index: number) => ({
      No: index + 1,
      Tanggal: item.chat_pertama ? dayjs(item.chat_pertama).format('DD-MM-YYYY HH:mm') : '',
      Alasan: item.alasan ?? '',
      Via: item.via ?? '',
    }))
    const wsChat = XLSX.utils.json_to_sheet(chatData)
    XLSX.utils.book_append_sheet(wb, wsChat, 'Detail Chat')
  }

  const rawLabel = (row.label ?? '').toString()
  const safeLabel = rawLabel.replace(/[\\\/:*?"<>|]/g, '-')
  const fileName = `NetProfit_${safeLabel || dayjs().format('YYYY-MM-DD')}.xlsx`

  XLSX.writeFile(wb, fileName)
}
</script>
