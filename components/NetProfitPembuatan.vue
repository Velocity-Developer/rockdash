<script setup lang="ts">
const props = defineProps(['dataNetProfit','loading']);
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()

const filter = reactive({
  tgl_dari: 1,
  tgl_sampai: Number(dayjs().format('D').toString())
});

const loading = ref(false);
const data = ref([] as any);

const normalizeDay = (value: unknown, fallback: number) => {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) return fallback;
  return Math.min(Math.max(Math.trunc(normalized), 1), 31);
}

const toNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(normalized) ? normalized : 0;
}

const getData = async () => {
  loading.value = true
  try {
    const tglDari = normalizeDay(filter.tgl_dari, 1);
    const tglSampai = normalizeDay(filter.tgl_sampai, tglDari);

    filter.tgl_dari = Math.min(tglDari, tglSampai);
    filter.tgl_sampai = Math.max(tglDari, tglSampai);

    const netProfitData = Array.isArray(props.dataNetProfit?.data) ? props.dataNetProfit.data : [];

    data.value = netProfitData.map((item: any) => {
      const startDay = filter.tgl_dari;
      const endDay = filter.tgl_sampai;

      const chats = Array.isArray(item.chat_details) ? item.chat_details : [];
      const chat_ads = chats.filter((chat: any) => {
        if (!chat.chat_pertama) return false;
        const day = new Date(chat.chat_pertama).getDate();
        return day >= startDay && day <= endDay;
      }).length;
      
      const projects = Array.isArray(item.projects) ? item.projects : [];

      const orders = projects.filter((project: any) => {
        if (!project.tgl_masuk) return false;
        const day = new Date(project.tgl_masuk).getDate();
        return day >= startDay && day <= endDay;
      }).length;

      const totalDibayar = projects.reduce((total: number, project: any) => {
        if (!project?.dibayar) return total;

        const sourceDate = project?.tgl_masuk || project?.webhost?.waktu;
        if (!sourceDate) return total;
        const day = new Date(sourceDate).getDate();
        if (day < startDay || day > endDay) return total;

        const value = toNumber(project.dibayar);

        if (Number.isNaN(value)) return total;
        return total + value;
      }, 0);

      const omzet = totalDibayar
      const hargaDomain = toNumber(item.harga_domain)
      const biayaDomain = hargaDomain * orders
      const profit_kotor = omzet - biayaDomain
      const orderPersen = chat_ads > 0 ? ((orders / chat_ads) * 100).toFixed(1) : '0.0'
      const profitPerOrder = orders > 0 ? profit_kotor / orders : 0

      return {
        label: item.label,
        biaya_domain: biayaDomain,
        order: orders,
        order_persen: orderPersen,
        total_dibayar: totalDibayar,
        omzet: omzet,
        profit_kotor: profit_kotor,
        profit_per_order: profitPerOrder,
        chat_ads
      };
    });
  } catch(e){
    console.log(e)
  } finally {
    loading.value = false
  }
}

watch(() => props.dataNetProfit, (newValue, oldValue) => {
  getData()
});
</script>

<template>
    <Card>
      <template #header>
        <div class="px-5 pt-3 font-bold">
          Pembuatan dari tanggal {{ filter.tgl_dari }} sampai {{ filter.tgl_sampai }}
        </div>
      </template>
      <template #content>
        <div class="flex flex-col md:flex-row md:items-end gap-1 mb-3">
          <div>
            <label class="mb-1 block text-xs">Dari :</label>
            <InputNumber v-model="filter.tgl_dari" :min="1" showButtons size="small"/>
          </div>
          <div>
            <label class="mb-1 block text-xs">Sampai :</label>
            <InputNumber v-model="filter.tgl_sampai" :min="1" showButtons size="small"/>
          </div>
          <div>
            <Button @click="getData">
              <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin"/>
              <Icon v-else name="lucide:filter"/>
            </Button>
          </div>
        </div>

        <div v-if="!loading && data">
          <DataTable :value="data" class="text-sm mt-4" size="small" :loading="props.loading" stripedRows scrollable>
            <Column field="label" header="Bulan" />
            <Column field="chat_ads" header="Chat Ads" />
            <Column field="order" header="Order" />
            <Column field="label" header="%Order">        
                <template #body="slotProps">
                  {{ slotProps.data.order_persen }} %
                </template>
            </Column>
            <Column field="omzet" header="Omzet">        
                <template #body="slotProps">
                  {{ formatMoney(slotProps.data.omzet,'',0) }}
                </template>
            </Column>
            <Column field="label" header="Biaya Domain">        
                <template #body="slotProps">
                  {{ formatMoney(slotProps.data.biaya_domain,'',0) }}
                </template>
            </Column>
            <Column field="profit_kotor" header="Profit Kotor">        
                <template #body="slotProps">
                  {{ formatMoney(slotProps.data.profit_kotor,'',0) }}
                </template>
            </Column>
            <Column field="profit_per_order" header="Profit Kotor/Order">        
                <template #body="slotProps">
                  {{ formatMoney(slotProps.data.profit_per_order,'',0) }}
                </template>
            </Column>
          </DataTable>          
        </div>

        <div v-if="loading" class="flex item-center justify-center h-10 gap-2 opacity-75">
        <Icon name="lucide:loader" class="animate-spin"/> Memuat data...
        </div>
        </template>
      </Card>

</template>

<style scoped></style>
