<template>

<div class="flex flex-col md:flex-row md:items-end gap-1">
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

  <div>
    <DataTable :value="data.data" class="text-xs mt-4" size="small" stripedRows scrollable>
      <Column field="label" header="Bulan">
        <template #body="slotProps">
          {{ slotProps.data.label }}
        </template>
      </Column>
      <Column field="biaya_iklan" header="Biaya Iklan">
        <template #body="slotProps">
          {{ formatMoney(slotProps.data.biaya_iklan,'',0) }}
        </template>
      </Column>
      <Column field="chat_ads" header="Chat Ads">
        <template #body="slotProps">
          -
        </template>
      </Column>
      <Column field="order" header="Order">
        <template #body="slotProps">
          {{ slotProps.data.order }}
        </template>
      </Column>
      <Column field="persen_order" header="%Order">
        <template #body="slotProps">
          -
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
          -
        </template>
      </Column>
      <Column field="profit_kotor" header="Net Profit">
        <template #body="slotProps">
          -
        </template>
      </Column>
      <Column field="profit_kotor" header="Biaya / Order">
        <template #body="slotProps">
          -
        </template>
      </Column>
    </DataTable>

  </div>

  <DashLoader :loading="loading"/>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Net Profit',
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
</script>
