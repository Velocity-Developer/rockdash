<template>

  <div class="w-full flex flex-col md:flex-row gap-2 md:justify-between items-end text-xs mb-5">
    <form @submit.prevent="getData()" class="hidden md:flex items-end gap-2">
      <div>
        <div class="mb-1 opacity-50">Per Page : </div>            
        <InputText type="number" v-model="filters.per_page" placeholder="per Page" size="small" class="w-[70px] shadow rounded" />
      </div>
      <div class="hidden md:block">
          <div class="mb-1 opacity-50">Tgl</div>
          <div class="flex items-center justify-end gap-2 mt-1">
            <DatePicker v-model="filters.tgl_start" dateFormat="dd/mm/yy" placeholder="dari" size="small" class="w-[130px] shadow rounded"/>
            <DatePicker v-model="filters.tgl_end" dateFormat="dd/mm/yy" placeholder="sampai" size="small" class="w-[130px] shadow rounded"/>
          </div>
      </div>
      <div>
        <Button type="submit" size="small" severity="info" class="shadow-md">
          Go
        </Button>
      </div>
    </form>

    <div class="flex justify-end items-center gap-2">
      <Button @click="openActionDialog('add',{})" size="small" class="shadow-md">
        <Icon name="lucide:plus-circle" /> <span class="hidden md:inline-block">Tambah</span>
      </Button>
      <Button @click="visibleDrawerFilter = true" size="small" severity="info" class="shadow-md">
        <Icon name="lucide:filter" /> Filter
        <span
        class="w-2 h-2 bg-red-300 rounded-full inline-block absolute top-0 right-0 m-1"
        v-if="filters.nama_web || filters.jenis"
        ></span>
      </Button>
    </div>
  </div>

  <Card v-if="dataClientSupport && dataClientSupport.length > 0">
    <template #content>
      <DataTable 
        :value="dataClientSupport" 
        size="small" class="text-xs" 
        scrollable scrollHeight="80vh"
        paginator :rows="25" :rowsPerPageOptions="[5, 10, 25, 50]"
      >
        <Column field="tanggal" header="Tanggal" class="whitespace-nowrap align-top"> 
          <template #body="slotProps">
            <span @click="openActionDialog('preview',slotProps.data)" class="cursor-pointer hover:underline">
              {{ dayjs(slotProps.data?.tanggal).format('DD/MM/YYYY') }}
            </span>
          </template>
        </Column>      
        <Column field="revisi_1" header="Revisi 1" class="align-top">
          <template #body="slotProps">
            <ul v-if="slotProps.data?.revisi_1" class="list-decimal pl-4">
              <li v-for="(item, index) in slotProps.data?.revisi_1" :key="index" class="cursor-pointer hover:underline">
                <span>{{ item.nama_web }}</span> <span class="text-primary ml-1">({{ item.jenis }})</span>
              </li>
            </ul>
          </template>
        </Column>   
        <Column field="perbaikan_revisi_1" header="Per. Revisi 1" class="align-top">
          <template #body="slotProps">
            <ul v-if="slotProps.data?.perbaikan_revisi_1" class="list-decimal pl-4">
              <li v-for="(item, index) in slotProps.data?.revisi_1" :key="index" class="cursor-pointer hover:underline">
                <span>{{ item.nama_web }}</span> <span class="text-primary ml-1">({{ item.jenis }})</span>
              </li>
            </ul>
          </template>
        </Column>  
        <Column field="revisi_2" header="Revisi 2" class="align-top">
          <template #body="slotProps">
            <ul v-if="slotProps.data?.revisi_2" class="list-decimal pl-4">
              <li v-for="(item, index) in slotProps.data?.revisi_2" :key="index" class="cursor-pointer hover:underline">
                <span>{{ item.nama_web }}</span> <span class="text-primary ml-1">({{ item.jenis }})</span>
              </li>
            </ul>
          </template>
        </Column>  
        <Column field="perbaikan_revisi_2" header="Per. Revisi 2" class="align-top">
          <template #body="slotProps">
            <ul v-if="slotProps.data?.perbaikan_revisi_2" class="list-decimal pl-4">
              <li v-for="(item, index) in slotProps.data?.perbaikan_revisi_2" :key="index" class="cursor-pointer hover:underline">
                <span>{{ item.nama_web }}</span> <span class="text-primary ml-1">({{ item.jenis }})</span>
              </li>
            </ul>
          </template>
        </Column>   
        <Column field="tanya_jawab" header="Tanya Jawab" class="align-top">
          <template #body="slotProps">
            <span v-if="slotProps.data?.tanya_jawab" v-for="(item, index) in slotProps.data?.tanya_jawab" class="cursor-pointer hover:underline decoration-pink-500">
              {{ item.nama_web }};
            </span>
          </template>
        </Column> 
        <Column field="update_web" header="Update Web" class="align-top">
          <template #body="slotProps">
            <span v-if="slotProps.data?.update_web" v-for="(item, index) in slotProps.data?.update_web" class="cursor-pointer hover:underline decoration-indigo-500">
              {{ item.nama_web }};
            </span>
          </template>
        </Column>  
        <Column field="act" header="Aksi" class="align-top">
          <template #body="slotProps">            
            <div class="flex items-center justify-center gap-1">
              <Button @click="openActionDialog('preview',slotProps.data)" size="small" severity="primary">
                <Icon name="lucide:eye" />
              </Button>
              <Button @click="openActionDialog('edit',slotProps.data)" size="small" severity="info">
                <Icon name="lucide:edit" />
              </Button>
            </div>
          </template>
        </Column> 
      </DataTable>
    </template>
  </Card>

  <div v-if="!dataClientSupport || dataClientSupport.length === 0">
    <div class="flex justify-center items-center py-5 gap-2 opacity-50 border rounded-md">
      <Icon name="lucide:inbox" size="45" />
      Tidak ada data
    </div>
  </div>

  <Drawer v-model:visible="visibleDrawerFilter" header="Filters" position="right">
    <form @submit.prevent="filterSubmit" class="space-y-3">
        <div>
          <div class="text-sm opacity-75">Jenis</div>
          <Select 
            v-model="filters.jenis" 
            placeholder="Pilih jenis" 
            class="w-full"
            optionLabel="label"
            optionValue="value"
            :options="[
              { value: 'revisi_1', label: 'Revisi 1' },
              { value: 'revisi_2', label: 'Revisi 2' },
            ]"
            showClear
          />
        </div>
        <div>
          <div class="text-sm opacity-75">Nama Web</div>
          <InputText v-model="filters.nama_web" placeholder="Nama Web" class="w-full"/>
        </div>
        <div>
          <div class="text-sm opacity-75">Dari tanggal</div>
          <DatePicker v-model="filters.tgl_start" dateFormat="dd/mm/yy" placeholder="dari" class="w-full"/>
        </div>
        <div>
          <div class="text-sm opacity-75">Sampai tanggal</div>
          <DatePicker v-model="filters.tgl_end" dateFormat="dd/mm/yy" placeholder="sampai" class="w-full"/>
        </div>
        <Button type="submit" class="w-full shadow">
          <Icon name="lucide:filter" /> Filter
        </Button>
    </form>
  </Drawer>
  
  <Dialog 
    v-model:visible="visibleDialog" modal 
    :header="actionDialog=='add'?'Tambah':actionDialog=='edit'?'Edit':'Preview'" 
    :style="actionDialog=='add'?'width: 30rem':{ width: '50rem' }" 
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <ClientSupportPreview 
      v-if="actionDialog=='preview'" 
      :data="selectedData"
      @edit="openActionDialog('edit',selectedData)"
    />
    <ClientSupportAdd v-if="actionDialog=='add'" :tanggal="filters.tgl_start" @submit="visibleDialog = false;getData()"/>
    <ClientSupportEdit v-if="actionDialog=='edit'" :tanggal="selectedData.tanggal" @update="getData()"/>
  </Dialog>

  <DashLoader :loading="loading" />

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Client Support',
    description: 'Daftar Client Support',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const client = useSanctumClient();
const page = ref(route.query.page ? Number(route.query.page) : 1);
const tglStartQuery = route.query.tgl_start as string | undefined
const tglEndQuery = route.query.tgl_end as string | undefined

const filters = reactive({
  per_page: route.query.per_page || 50,
  page: computed(() => page.value),
  tgl_start: route.query.tgl_start
    ? dayjs(tglStartQuery, 'YYYY-MM-DD').toDate()
    : dayjs().toDate(),
  tgl_end: tglEndQuery
    ? dayjs(tglEndQuery, 'YYYY-MM-DD').toDate()
    : null,
  nama_web: route.query.nama_web || '',
  jenis: route.query.jenis || '',
} as any);

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  
  // ubah format tgl_start dan tgl_end menjadi YYYY-MM-DD
  if (filters.tgl_start) {
      filters.tgl_start = dayjs(filters.tgl_start).format('YYYY-MM-DD');
  }
  if (filters.tgl_end) {
      filters.tgl_end = dayjs(filters.tgl_end).format('YYYY-MM-DD');
  }
  
  router.push({
    query: { ...filters },
  });
}

const loading = ref(false)
const dataClientSupport = ref<any>({})
const getData = async () => {
    loading.value = true
    updateRouteParams()

    try {
      const res = await client('/api/client_support',{
        params: filters
      })
      dataClientSupport.value = res
    } catch (error) {
        console.log(error)
        loading.value = false
    } finally {
        loading.value = false
    }
}

//onMounted
onMounted(() => {
    getData()
})

const visibleDrawerFilter = ref(false);
const filterSubmit = async () => {
    getData()
    visibleDrawerFilter.value = false;
}

const selectedData = ref<any>({})
const actionDialog = ref('preview')
const visibleDialog = ref(false);
const openActionDialog = (action: string,data: any) => {
  selectedData.value = data
  actionDialog.value = action
  visibleDialog.value = true
}

</script>
