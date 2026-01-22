<template>

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
    <template #content>
    <div class="mb-2">
      Pembuatan
    </div>
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

  <DashLoader :loading="loading"/>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Net Profit',
    development: true
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute()
const router = useRouter()

const filter = reactive({
    bulan_dari: route.query.bulan_dari || dayjs().subtract(1, 'year').format(''),
    bulan_sampai: route.query.bulan_sampai || dayjs().format(''),
} as any)
function updateRouteParams() {
  router.push({
    query: { ...filter },
  });
}

const loading = ref(false);
const data = ref([] as any);
const getData = async () => {
  loading.value = true;
  
  //ubah bulan ke format YYYY-MM
  filter.bulan_dari = dayjs(filter.bulan_dari).utc().local().format('YYYY-MM');
  filter.bulan_sampai = dayjs(filter.bulan_sampai).utc().local().format('YYYY-MM');

  try {
    const response = await client('/api/laporan/net_profit',{
      params: filter,
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
const openChatPreview = (data: any) => {
  dialogChatPreview.value = true
  selectedChatPreview.value = data
}
</script>
