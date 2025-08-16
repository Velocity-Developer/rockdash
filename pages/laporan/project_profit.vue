<template>

  <div class="flex flex-col md:flex-row md:items-end gap-1">
    <div>
      <label class="mb-1 block text-xs">dari bulan :</label>
      <DatePicker v-model="filter.month_start" view="month" dateFormat="mm/yy" size="small"/>
    </div>
    <div>
      <label class="mb-1 block text-xs">jangka tahun :</label>
      <Select 
        v-model="filter.jangka_waktu"
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

  <ScrollPanel v-if="data.data" style="width: 100%; height: 70vh" class="my-5">
      <table class="text-sm w-full">
        <thead>
          <tr class="bg-zinc-200 dark:bg-zinc-800">
            <th class="align-top py-2 px-3 text-left">No</th>
            <th class="align-top py-2 px-3 text-left">Website</th>
            <th class="align-top py-2 px-3 text-left">Jenis</th>
            <th class="align-top py-2 px-3 text-left">Jumlah</th>
            <th class="align-top py-2 px-3 text-right">Profit</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(web,i) in data.data">

            <tr class="bg-emerald-100 dark:bg-emerald-700">
                <td class="align-top border-b border-gray-100 dark:border-gray-800 py-2 px-3">  
                  {{ i+1 }}                
                </td>
                <td class="align-top border-b border-gray-100 dark:border-gray-800 py-2 px-3">
                    {{ web.nama_web??'' }}
                </td>
                <td class="align-top border-b border-gray-100 dark:border-gray-800 py-2 px-3">                  
                </td>
                <td class="align-top border-b border-gray-100 dark:border-gray-800 py-2 px-3">                  
                </td>
                <td class="align-top border-b border-gray-100 dark:border-gray-800 py-2 px-3 text-right">
                  <strong>
                    {{ formatMoney(web.profit) }}
                  </strong>
                </td>
              </tr>

            <template v-if="web.results" v-for="(item,jenis) in web.results" :key="item.id">
              <tr class="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
                <td colspan="2" class="align-top border-b border-gray-100 dark:border-gray-800 py-2 px-3">                    
                </td>
                <td class="align-top border-b border-gray-100 dark:border-gray-800 py-2 px-3">
                  {{ jenis }}
                </td>
                <td class="align-top border-b border-gray-100 dark:border-gray-800 py-2 px-3">
                  {{ item.count }}
                </td>
                <td class="align-top border-b border-gray-100 dark:border-gray-800 py-2 px-3 text-right">
                    {{ formatMoney(item.biaya) }}
                </td>
              </tr>
            </template>

          </template>
        </tbody>
      </table>
  </ScrollPanel>


</template>

<script setup lang="ts">
definePageMeta({
    title: 'Laporan Project Profit',
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();

const filter = reactive({
    month_start: route.query.month_start || dayjs().subtract(1, 'month').format(''),
    month_end: route.query.month_end || dayjs().format(''),
    jangka_waktu: route.query.jangka_waktu || 1,
} as any);

const loading = ref(false);
const data = ref([] as any);
const getData = async () => {
  loading.value = true;

  //ubah bulan ke format YYYY-MM
  filter.month_start = dayjs(filter.month_start).utc().local().format('YYYY-MM');
  filter.month_end = dayjs(filter.month_end).utc().local().format('YYYY-MM');

  try {
    const response = await client('/api/laporan/project_profit',{
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
