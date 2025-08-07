<template>

  <div class="flex flex-col md:flex-row md:items-end gap-1 mb-3">
    <div>
      <label class="mb-1 block text-xs">Bulan :</label>
      <DatePicker v-model="filter.bulan" view="month" dateFormat="mm/yy" size="small"/>
    </div>
    <div>
      <Button @click="getData">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:search"/>
      </Button>
    </div>
  </div>
  
  <Card>
    <template #content>

      <table class="w-full">
        <thead>
          <tr class="border border-b">
            <th class="px-3 py-2 text-left">Jenis</th>
            <th class="px-3 py-2 text-left">Total</th>
            <th class="px-3 py-2 text-right">Nominal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data.data" v-for="item in data.data" :key="item.jenis" class="border border-b">
            <td class="px-3 py-2 text-left">
              <span class="cursor-pointer hover:underline" @click="openDialog(item)">
              {{ item.label }}
              </span>
            </td>
            <td class="px-3 py-2 text-left">{{ item.total }}</td>
            <td class="px-3 py-2 text-right">{{ formatMoney(item.nominal,'Rp',0) }}</td>
          </tr>
        </tbody>
      </table>
      
    </template>
  </Card>

  <Card class="my-4">
    <template #content>
      <table class="w-full">
        <thead>
          <tr class="border border-b">
            <th class="px-3 py-2 text-left">Jenis</th>
            <th class="px-3 py-2 text-left">Total</th>
            <th class="px-3 py-2 text-right">Nominal</th>
          </tr>
        </thead>
        <tbody><tr v-if="data.meta" v-for="item in data.meta" :key="item.jenis" class="border border-b">
            <td class="px-3 py-2 text-left">
              {{ item.label }}
            </td>
            <td class="px-3 py-2 text-left">{{ item.total }}</td>
            <td class="px-3 py-2 text-right">{{ formatMoney(item.nominal,'Rp',0) }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </Card>


  <Dialog v-model:visible="visibleDialog" modal header="" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
   
    <div v-if="dataDialog && dataDialog.webhosts">
      <DataTable 
        :value="dataDialog.webhosts" 
        size="small" 
        class="text-sm" 
        stripedRows scrollHeight="72vh" 
        scrollable
      >
        <Column header="No" headerStyle="width:3rem">
          <template #body="slotProps">
            {{ slotProps.index + 1 }}
          </template>
        </Column>
        <Column field="nama_web" header="Nama Web">
          <template #body="slotProps">
            {{ slotProps.data.nama_web }}
          </template>
        </Column>
        <Column field="project" header="Riwayat">
          <template #body="slotProps">
            <table>
              <tbody>
                <tr v-for="(item,index) in slotProps.data.cs_main_project" :key="index">
                  <td class="px-3 py-2 text-left">{{ item.jenis }}</td>
                  <td class="px-3 py-2 text-left border-x">{{ item.tgl_masuk }}</td>
                  <td class="px-3 py-2 text-right">{{ formatMoney(item.dibayar,'',0) }}</td>
                </tr>
              </tbody>
            </table>
          </template>
        </Column>
      </DataTable>
    </div>

  </Dialog>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Laporan Siklus Layanan',
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const router = useRouter()

const filter = reactive({
    bulan: route.query.bulan_end || dayjs().format(''),
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
  filter.bulan = dayjs(filter.bulan).utc().local().format('YYYY-MM');
  updateRouteParams()

  try {
    const response = await client('/api/laporan/siklus_layanan',{
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

onMounted(()=>{
  getData()
})

const visibleDialog = ref(false);
const dataDialog = ref({} as any);
const openDialog = async (data = {} as any) => {
  visibleDialog.value = true;
  dataDialog.value = data;

  // dataDialog.value.webhosts = dataDialog.value.webhosts.map((item: any, index: number) => {
  //   item.no = index + 1;
  //   return item;
  // });
}

</script>
