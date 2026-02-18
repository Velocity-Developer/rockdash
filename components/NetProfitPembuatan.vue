<script setup lang="ts">
const props = defineProps(['dataNetProfit']);
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()

const filter = reactive({
  tgl_dari: 1,
  tgl_sampai: Number(dayjs().format('D').toString())
});

const loading = ref(false);
const data = ref([] as any);
const getData = async () => {
  loading.value = true
  try {
    data.value = props.dataNetProfit.data.map((item: any) => {

      const chats = Array.isArray(item.chat_details) ? item.chat_details : [];
      const chat_ads = chats.filter((chat: any) => {
        if (!chat.chat_pertama) return false;
        const day = new Date(chat.chat_pertama).getDate();
        return day <= filter.tgl_sampai;
      }).length;
      
      const projects = Array.isArray(item.projects) ? item.projects : [];

      const orders = projects.filter((project: any) => {
        if (!project.tgl_masuk) return false;
        const day = new Date(project.tgl_masuk).getDate();
        return day <= filter.tgl_sampai;
      }).length;

      const totalDibayar = projects.reduce((total: number, project: any) => {
        if (!project?.dibayar) return total;

        const day = new Date(project.tgl_masuk).getDate();
        //jika tgl_masuk lebih dari day, return
        if(day > filter.tgl_sampai) return total;

        const clean = String(project.dibayar).replace(/[^\d]/g, '');
        const dibayar = Number(clean);

        return isNaN(dibayar) ? total : total + dibayar;
      }, 0);

      return {
        label: item.label,
        biaya_domain: item.harga_domain*orders,
        order: orders,
        order_persen: ((orders/chat_ads)*100).toFixed(1),
        total_dibayar: totalDibayar,
        omzet: totalDibayar-(item.harga_domain*orders),
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
          Pembuatan dari tanggal {{ filter.tgl_dari }} - {{ filter.tgl_sampai }}
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
          <DataTable :value="data" class="text-xs mt-4" size="small" stripedRows scrollable>
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
            <Column field="label" header="Biaya Domain">        
                <template #body="slotProps">
                  {{ formatMoney(slotProps.data.omzet,'',0) }}
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
