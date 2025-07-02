<template>

  <div class="flex flex-col md:flex-row md:items-end gap-1">
    <div>
      <label class="mb-1 block text-xs">dari bulan :</label>
      <DatePicker v-model="filter.month_start" view="month" dateFormat="mm/yy" size="small"/>
    </div>
    <div>
      <label class="mb-1 block text-xs">sampai bulan :</label>
      <DatePicker v-model="filter.month_end" view="month" dateFormat="mm/yy" size="small"/>
    </div>
    <div>
      <Button @click="getData">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:search"/>
      </Button>
    </div>
  </div>

  <ScrollPanel v-if="data.data" style="width: 100%; height: 70vh">
      <table class="table-fixed border-collapse text-sm">
        <tbody>
          <tr v-for="item in data.data" :key="item.id" class="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
            <td class="align-top border-b border-gray-100 dark:border-gray-800 p-2">
              {{ item }}
            </td>
          </tr>
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
} as any);

const loading = ref(false);
const data = ref([] as any);
const getData = async () => {
  loading.value = true;
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
