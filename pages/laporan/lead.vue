<template>
  <div class="space-y-6 pt-10">

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

    </Card>
    
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Lead Order',
    page_key:'lead',
    development: true
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
import * as XLSX from 'xlsx'
const dayjs = useDayjs()
const route = useRoute()
const router = useRouter()

const filter = reactive({
  bulan_dari: route.query.dari
    ? dayjs(route.query.dari as string).toDate()
    : dayjs().subtract(6, 'month').toDate(),

  bulan_sampai: route.query.sampai
    ? dayjs(route.query.sampai as string).toDate()
    : dayjs().toDate()
});

const loading = ref(false);
const data = ref([] as any);
const getData = async () => {
  // loading.value = true;
}
</script>
