<template>
  
  <div class="flex flex-col md:flex-row md:items-end gap-1">
    <div>
      <label class="mb-1 block text-xs">Bulan :</label>
      <DatePicker v-model="filter.bulan_start" view="month" dateFormat="mm/yy" size="small"/>
    </div>
    <div>
      <label class="mb-1 block text-xs">Sampai :</label>      
      <DatePicker v-model="filter.bulan_end" view="month" dateFormat="mm/yy" size="small"/>
    </div>
    <div>
      <Button @click="getData">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:search"/>
      </Button>
    </div>
  </div>

  <div v-if="data.data && data.data.length > 0" class="mt-3">

    <Card class="my-3">
      <template #content>
        <div class="grid grid-cols-2 gap-4">

            <div class="overflow-x-auto">
              <div class="mb-3 font-bold">
               Profit Pembuatan {{ data.bulan }}
              </div>
              <table class="table-fixed border-collapse text-sm border w-full">
                <tbody>
                  <tr v-for="(item,i) in data.info_pembuatan" :key="i" class="odd:bg-slate-50 even:bg-white dark:odd:bg-zinc-800 dark:even:bg-zinc-900">
                    <td class="p-2 border-b text-left">{{ i }}</td>
                    <td class="p-2 border-b text-right">{{ item }}</td>
                  </tr>
                </tbody>
              </table>

              <div class="my-3 font-bold">
                Rincian Profit
              </div>
              <table class="table-fixed border-collapse text-sm border w-full">
                <tbody>
                  <tr v-for="(item,i) in data.info" :key="i" class="odd:bg-slate-50 even:bg-white dark:odd:bg-zinc-800 dark:even:bg-zinc-900">
                    <td class="p-2 border-b text-left">{{ i }}</td>
                    <td class="p-2 border-b text-right">{{ item }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="overflow-x-auto">
              
              <div class="mb-3 font-bold">
                Rincian Jasa
              </div>
              <table class="table-fixed border-collapse text-sm border w-full">
                <thead>
                  <tr>
                    <th class="p-2 text-left">Jenis</th>
                    <th class="p-2 text-left">Total</th>
                    <th class="p-2 text-right">Nominal Profit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item,i) in data.data_order_jenis" :key="i" class="odd:bg-slate-50 even:bg-white dark:odd:bg-zinc-800 dark:even:bg-zinc-900">
                    <td class="p-2 border-b text-left">{{ i }}</td>
                    <td class="p-2 border-b text-left">{{ item.total }}</td>
                    <td class="p-2 border-b text-right">{{ formatMoney(item.profit,'Rp',0) }}</td>
                  </tr>
                </tbody>
              </table>

            </div>

        </div>
      </template>
  </Card>

    <Card class="mt-5">
      <template #content>
      <DataTable :value="data.kumulatif.data" :paginator="true" :rows="10" :rowsPerPageOptions="[50, 100, 250, 500]" responsiveLayout="scroll">
        <Column field="webhost.id_webhost" header="#" headerStyle="width:2rem">
          <template #body="slotProps">
            {{ slotProps.index + 1 }}
          </template>
        </Column>
        <Column field="webhost.nama_web" header="Web">
          <template #body="slotProps">
            <div class="max-w-[12em] truncate text-sm" v-tooltip="slotProps.data.webhost.nama_web">
              {{ slotProps.data.webhost.nama_web }}
            </div>
          </template>
        </Column>
        <Column field="rincian" header="Rincian">
          <template #body="slotProps">
            <div class="overflow-x-auto">
              <table class="table-fixed border-collapse text-sm border dark:border-gray-600 w-[50em] shadow hover:shadow-lg bg-zinc-100 dark:bg-zinc-800">
                <thead>
                  <tr>
                    <th class="px-2 border-b text-left">Jenis</th>
                    <th class="px-2 border-b text-left">Total</th>
                    <th class="px-2 border-b text-right">Nominal</th>
                    <th class="px-2 border-b text-right">Profit</th>
                  </tr>
                </thead>
                <tbody v-if="slotProps.data.webhost?.data_jenis">
                  <tr v-for="(item,i) in slotProps.data.webhost.data_jenis" class="odd:bg-slate-50 dark:odd:bg-slate-800">
                    <td class="p-2 border-b text-left">
                      <div class="max-w-[55em] min-w-[10em] truncate" v-tooltip="i">{{ item.label }}</div>
                    </td>
                    <td class="p-2 border-b text-left">{{ item.total }}</td>
                    <td class="p-2 border-b text-right">
                      <template v-if="item.dibayar">
                        {{ formatMoney(item.dibayar,'Rp',0) }}
                      </template>
                    </td>
                    <td class="p-2 border-b text-right">{{ formatMoney(item.profit,'Rp',0) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </Column>
        <Column field="webhost.rekap_biaya.total" header="Total Profit">
          <template #body="slotProps">
            <div class="text-right" v-if="slotProps.data.webhost?.total_profit">
            {{ formatMoney(slotProps.data.webhost.total_profit,'Rp',0) }}
            </div>
          </template>
        </Column>
      </DataTable>
      </template> 
    </Card>
    
  </div>

  <DashLoader :loading="loading"/>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Perpanjang Web BerJangka',
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute()
const router = useRouter()

const filter = reactive({
    bulan_start: route.query.bulan_start || dayjs().subtract(1, 'month').format(''),
    bulan_end: route.query.bulan_end || dayjs().format(''),
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
  filter.bulan_start = dayjs(filter.bulan_start).utc().local().format('YYYY-MM');
  filter.bulan_end = dayjs(filter.bulan_end).utc().local().format('YYYY-MM');
  updateRouteParams()

  try {
    const response = await client('/api/laporan/perpanjang_web_jangka',{
      params: filter,
    });
    data.value = response;
    loading.value = false;
  } catch (error) {
    const er = useSanctumError(error);
    loading.value = false;
  }
  loading.value = false;
}

onMounted(() => {
  getData()
})
</script>
