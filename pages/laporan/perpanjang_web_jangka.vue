<template>

  <div class="flex flex-col md:flex-row md:items-end gap-1">
    <div>
      <label class="mb-1 block text-xs">Bulan :</label>
      <DatePicker v-model="filter.bulan" view="month" dateFormat="mm/yy" size="small"/>
    </div>
    <div>
      <label class="mb-1 block text-xs">Jangka waktu :</label>
      <Select 
        v-model="filter.jangka"
        :options="[{label:'1 Tahun',value:1},{label:'2 Tahun',value:2},{label:'3 Tahun',value:3}]"
        optionLabel="label" optionValue="value"
        size="small"
      />
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
        <div class="overflow-x-auto">
          <div class="mb-3 font-bold">
            {{ data.bulan }}
          </div>
          <table class="table-fixed border-collapse text-sm border w-full">
            <tbody>
              <tr v-for="(item,i) in data.info" :key="i" class="odd:bg-slate-50 even:bg-white dark:odd:bg-zinc-800 dark:even:bg-zinc-900">
                <td class="p-2 border-b text-left">{{ i }}</td>
                <td class="p-2 border-b text-right">{{ formatMoney(item) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
  </Card>

    <Card class="mt-5">
      <template #content>
      <DataTable :value="data.data" :paginator="true" :rows="10" responsiveLayout="scroll">
        <Column field="webhost.nama_web" header="Web">
          <template #body="slotProps">
            <div class="max-w-[15em] truncate">{{ slotProps.data.webhost.nama_web }}</div>
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
                    <th class="px-2 border-b text-right">Biaya</th>
                    <th class="px-2 border-b text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item,i) in slotProps.data.webhost.rekap_biaya.jenis" class="odd:bg-slate-50 dark:odd:bg-slate-800">
                    <td class="p-2 border-b text-left">
                      <div class="max-w-[15em] truncate">{{ i }}</div>
                    </td>
                    <td class="p-2 border-b text-left">{{ item.total }}</td>
                    <td class="p-2 border-b text-right">{{ formatMoney(item.biaya) }}</td>
                    <td class="p-2 border-b text-right">{{ formatMoney(item.profit) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </Column>
        <Column field="webhost.rekap_biaya.total" header="Total Profit">
          <template #body="slotProps">
            <div class="text-right">
            {{ formatMoney(slotProps.data.webhost.rekap_biaya.total) }}
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

const filter = reactive({
    bulan: route.query.bulan || dayjs().subtract(1, 'month').format(''),
    jangka: route.query.jangka || 1,
} as any)

const loading = ref(false);
const data = ref([] as any);
const getData = async () => {
  loading.value = true;

  //ubah bulan ke format YYYY-MM
  filter.bulan = dayjs(filter.bulan).utc().local().format('YYYY-MM');

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
