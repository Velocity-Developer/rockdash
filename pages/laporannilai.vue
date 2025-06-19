<template>

  <div class="flex items-center justify-end gap-1 mb-3">
    <DatePicker v-model="filters.bulan" showIcon view="month" placeholder="Bulan" size="small" dateFormat="yy-mm" />
    <SelectButton 
      v-model="filters.jenis_project" 
      :options="[{label:'Semua',value:0},{label:'Biasa',value:10},{label:'Custom',value:12}]"
      optionLabel="label" optionValue="value" size="small" 
    />
    
  </div>

  <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mt-5">

    <div class="md:col-span-2">
      <Card class="bg-emerald-50 dark:bg-zinc-800">
        <template #content>
          <LaporanNilaiChart :datachart="data.users" class="mx-auto"/>
        </template>
      </Card>
    </div>

    <div class="md:col-span-3">
      <Card>
        <template #content>
          <DataTable
            v-if="data.users"
            :value="data.users" 
            size="small" 
            class="mb-5" 
            stripedRows
            scrollable
          >
            <Column field="name" header="Nama">
              <template #body="slotProps">
                <div class="flex items-center">
                  <Avatar :image="slotProps.data.avatar" class="w-7 h-7 mr-2" size="large" shape="circle" />
                  {{ slotProps.data.name }}
                </div>
              </template>
            </Column>
            <Column field="total" header="Total"></Column>
          </DataTable>
        </template>
      </Card>
    </div>

  </div>



  <!-- <Tabs value='21' class="shadow rounded bg-zinc-100 mt-5">
      <TabList>
          <Tab v-for="tab in data.users" :key="tab.id" :value="tab.id">
            <div class="flex items-center text-xs font-normal">          
              <Avatar :image="tab.avatar" class="w-5 h-5 mr-2" size="large" shape="circle" />
              {{ tab.name }}
            </div>
          </Tab>
      </TabList>
      <TabPanels>
          <TabPanel v-for="tab in data.users" :key="tab.id" :value="tab.id">
              
             <DataTable
                v-if="data.data[tab.id]"
                :value="data.data[tab.id].projects" 
                size="small" 
                class="text-xs mb-5" 
                stripedRows scrollHeight="75vh" 
                scrollable
              >
                <Column header="No" headerStyle="width:3rem">
                  <template #body="slotProps">
                      {{ slotProps.index + 1 }}
                  </template>
                </Column>
                <Column field="webhost.nama_web" header="Nama Web"></Column>
                <Column field="jenis" header="Jenis"></Column>
                <Column field="deskripsi" header="Deskripsi"></Column>
                <Column field="wm_project.status_multi" header="Status"></Column>
                <Column field="wm_project.date_mulai_formatted" header="Mulai"></Column>
                <Column field="wm_project.date_selesai_formatted" header="Selesai"></Column>
              </DataTable> 
              
          </TabPanel>
      </TabPanels>
  </Tabs> -->

  <DashLoader :loading="loading"/>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Laporan Tim',
    description: 'Ikhtisar Pengerjaan project oleh Web Developer',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient();
const route = useRoute();

const filters = ref({
  bulan: route.query.bulan || dayjs().format('YYYY-MM'),
  jenis_project: route.query.jenis_project || 0,
} as any);

const data = ref([] as any) ;
const loading = ref(false);
const getData = async () => {
  loading.value = true;
  ///ubah bulan ke format YYYY-MM
  filters.value.bulan = dayjs(filters.value.bulan).format('YYYY-MM');
  try {
    const response = await client('/api/laporan_nilai',{
      params: filters.value,
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
  getData();
})

//watch filters.jenis_project
watch(() => filters.value.jenis_project, (newVal, oldVal) => {
  getData()
})
//watch filters.bulan
watch(() => filters.value.bulan, (newVal, oldVal) => {
  getData()
})

</script>
