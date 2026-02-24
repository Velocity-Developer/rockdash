<script setup lang="ts">
const props = defineProps(['data','loading']);
</script>

<template>

    <Card>
      <template #header>
        <div class="px-5 pt-3 flex justify-between items-center">          
          <span class="font-bold">Perpanjangan</span>
        </div>
      </template>
      <template #content>
        
          <DataTable :value="props.data.data" class="text-sm mt-4" size="small" :loading="props.loading" stripedRows scrollable>         
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