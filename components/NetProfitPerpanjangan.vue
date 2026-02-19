<script setup lang="ts">
const props = defineProps(['dari','sampai']);
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient()

const loading = ref(false);
const data = ref([] as any);
const getData = async () => {
  loading.value = true;
  try {
    const response = await client('/api/laporan/net_profit_perpanjangan',{
      params: {
        bulan_dari: dayjs(props.dari).utc().local().format('YYYY-MM'),
        bulan_sampai: dayjs(props.sampai).utc().local().format('YYYY-MM'),
      },
    });
    data.value = response;
    loading.value = false;
  } catch(er){

  } finally {
    loading.value = false;
  }
}

watch(() => [props.dari,props.sampai], () => {
  getData()
});
</script>

<template>

    <Card>
      <template #header>
        <div class="px-5 pt-3 flex justify-between items-center">          
          <span class="font-bold">Perpanjangan</span>
          <Button size="small" variant="text" @click="getData">
            <Icon name="lucide:refresh-cw" :class="loading?'animate-spin':''"/>
          </Button>
        </div>
      </template>
      <template #content>
        
          <DataTable :value="data.data" class="text-sm mt-4" size="small" stripedRows scrollable :loading="loading">         
            <Column field="label" header="Bulan" />        
            <Column field="total" header="Jumlah web" />   
            <Column field="omzet" header="Omzet">        
                <template #body="slotProps">
                  {{ formatMoney(slotProps.data.omzet,'',0) }}
                </template>
            </Column>
            <Column field="biaya_domain" header="Biaya Domain">        
                <template #body="slotProps">
                  {{ formatMoney(slotProps.data.biaya_domain,'',0) }}
                </template>
            </Column>
            <Column field="profit" header="Net Profit">        
                <template #body="slotProps">
                  {{ formatMoney(slotProps.data.profit,'',0) }}
                </template>
            </Column>
          </DataTable> 

      </template>
    </Card>

</template>