<template>

  <div class="flex items-center justify-end gap-1 mb-3">
    <DatePicker v-model="filters.bulan" showIcon view="month" placeholder="Bulan" size="small" dateFormat="yy-mm" class="w-[9rem]"/>
    <SelectButton 
      v-model="filters.jenis_project" 
      :options="[{label:'Semua',value:0},{label:'Biasa',value:10},{label:'Custom',value:12}]"
      optionLabel="label" optionValue="value" size="small" 
    />
    
  </div>

  <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mt-5">

    <div class="md:col-span-2">
      <Card>
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
                  <Avatar 
                  :image="slotProps.data.avatar" 
                  class="w-7 h-7 mr-2" 
                  size="large" 
                  shape="circle"                          
                  :pt="{
                    image: (options) => ({
                        class: [
                            '!object-cover',
                        ]
                    })
                  }"
                  />
                  {{ slotProps.data.name }}
                </div>
              </template>
            </Column>
            <Column field="progress" header="Pengerjaan"></Column>
            <Column field="selesai" header="Selesai"></Column>
            <Column field="total" header="Total"></Column>
          </DataTable>
        </template>
      </Card>
    </div>

  </div>


  <Tabs value="1" class="shadow rounded-lg overflow-hidden bg-zinc-100 mt-5">
      <TabList>
          <Tab v-for="tab in data.users" :key="tab.id" :value="tab.id">
            <div class="flex items-center text-xs font-normal">          
              <Avatar 
              :image="tab.avatar" 
              class="w-5 h-5 mr-2" 
              size="large" 
              shape="circle"                      
              :pt="{
                image: (options) => ({
                    class: [
                        '!object-cover',
                    ]
                })
              }"
              />
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
                <Column field="cs_main_project.webhost.nama_web" header="Nama Web">                  
                  <template #body="slotProps">
                    <span>
                      {{ slotProps.data.cs_main_project.webhost.nama_web }}
                    </span>
                    <Button v-if="isRoles('admin')" @click="confirmDelete(slotProps.data.id_wm_project)" type="button" severity="danger" size="small" variant="text">
                      <Icon name="lucide:trash-2"/>
                    </Button>
                  </template>
                </Column>
                <Column field="cs_main_project.jenis" header="Jenis">
                  <template #body="slotProps">
                    <div>{{ slotProps.data.cs_main_project.jenis }}</div>
                    <div class="text-primary" v-if="slotProps.data.cs_main_project.webhost.paket">
                      {{ slotProps.data.cs_main_project.webhost.paket.paket }}
                    </div>
                  </template>
                </Column>
                <!-- <Column field="deskripsi" header="Deskripsi"></Column> -->
                <Column field="status_multi" header="Status"></Column>
                <Column field="date_mulai_formatted" header="Mulai"></Column>
                <Column field="date_selesai_formatted" header="Selesai"></Column>
              </DataTable> 
              
          </TabPanel>
      </TabPanels>
  </Tabs>

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
  jenis_project: localStorage.getItem('jenis_project') 
    ? parseInt(localStorage.getItem('jenis_project') as string)
    : (route.query.jenis_project || 10),
} as any);

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { ...filters.value },
  });
}

const data = ref([] as any) ;
const loading = ref(false);
const getData = async () => {
  updateRouteParams() 
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
  localStorage.setItem('jenis_project', newVal.toString());
  getData();
});

//watch filters.bulan
watch(() => filters.value.bulan, (newVal, oldVal) => {
  getData()
})

const toast = useToast();
const confirm = useConfirm();
const confirmDelete = (id: any) => {    
    confirm.require({
        message: 'Anda yakin hapus pengerjaan project ini?',
        header: 'Hapus Pengerjaan',
        accept: async () => {
            loading.value = true
            try {              
              const re = await client(`/api/wm_project/${id}`, {
                  method: 'DELETE',
              })
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Project berhasil dihapus',
                life: 3000
              });
              getData()
            } catch (error) {
                const er = useSanctumError(error)                 
                toast.add({
                    severity: 'error',
                    summary: 'Gagal!',
                    detail: er.msg ? er.msg : 'Terjadi kesalahan saat menghapus data',
                    life: 3000
                });
            }
            loading.value = false
        },
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Hapus',
            severity: 'danger',
            outlined: false
        },
        reject: () => {
            //callback to execute when user rejects to delete
        }
    });
}
</script>
