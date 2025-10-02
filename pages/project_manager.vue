<template>

  <div class="mt-10 mb-3 flex justify-end items-center gap-2">
    <div class="hidden md:inline-block">
      <InputText @change="getData" type="number" v-model="filters.per_page" placeholder="per Page" size="small" class="w-[70px] shadow rounded" />
    </div>
    <Button @click="getData()" size="small" class="shadow-md">
      <Icon name="lucide:refresh-cw" :class="{'animate-spin': loading}" />
      <span class="hidden md:inline-block">Reload</span>
    </Button>
    <Button @click="visibleDrawerFilter = true" size="small" severity="info" class="shadow-md">
      <Icon name="lucide:filter" /> <span class="hidden md:inline-block">Filter</span>
      <span
      class="w-2 h-2 bg-yellow-300 rounded-full inline-block absolute top-0 right-0 m-1"
      v-if="filters.nama_web || filters.paket || filters.jenis || filters.deskripsi || filters.trf || filters.hp || filters.telegram || filters.hpads || filters.wa || filters.email"
      ></span>
    </Button>
  </div>

  <Card>
    <template #content>
      <DataTable :value="data.data" size="small" class="text-xs" stripedRows scrollHeight="70vh" tableStyle="min-width: 50rem" scrollable>
        <Column header="#" headerStyle="width:3rem">
          <template #body="slotProps">
              {{ slotProps.index + data.from }}
          </template>
        </Column>
        <Column field="jenis" header="Jenis">
          <template #body="slotProps">
            <div>{{ slotProps.data.jenis }}</div>
            <div class="text-xs text-primary">{{ slotProps.data.webhost?.paket?.paket }}</div>
          </template>
        </Column>
        <Column field="webhost.nama_web" header="Web">
          <template #body="slotProps">
            <div @click="openDialog('preview',slotProps.data)" class="whitespace-nowrap cursor-pointer" v-tooltip="slotProps.data.webhost?.nama_web">
              {{ slotProps.data.webhost?.nama_web }}
            </div>
          </template>
        </Column>
        <Column field="tgl_masuk" header="Waktu" class="whitespace-nowrap">
          <template #body="slotProps">
              <div>
                <div class="text-xs opacity-70">Masuk</div>
                {{ formatTanggal(slotProps.data.tgl_masuk) }}
              </div>
              <div class="mt-1">
                <div class="text-xs opacity-70">Deadline</div>
                {{ formatTanggal(slotProps.data.tgl_deadline) }}
              </div>
          </template>
        </Column>        
        <Column field="revisi_1" header="Rev.1" class="vertical-align-top">
          <template #body="slotProps">
            <ul class="list-disc ml-4">
              <li class="mb-1">
                <div class="text-xs opacity-70">Konf. Rev.1</div>
                {{ slotProps.data.pm_project?.konfirm_revisi_1 }}
              </li>
              <li class="mb-1">
                <div class="text-xs opacity-70">Follow up revisi</div>
                {{ slotProps.data.pm_project?.fr1 }}
              </li>
              <li class="mb-1">
                <div class="text-xs opacity-70">Revisi 1</div>
                <template v-if="slotProps.data.client_supports?.revisi_1">
                  {{ formatDate(slotProps.data.client_supports?.revisi_1, 'YYYY-MM-DD') }}
                </template>
              </li>
            </ul>
          </template>
        </Column>
        <Column field="revisi_2" header="Rev.2" class="vertical-align-top">
          <template #body="slotProps">
            <ul class="list-disc ml-4">
              <li class="mb-1">
                <div class="text-xs opacity-70">Konf. Rev.2</div>
                {{ slotProps.data.pm_project?.konfirm_revisi_2 }}
              </li>
              <li class="mb-1">
                <div class="text-xs opacity-70">Revisi 2 + Lunas</div>
                <template v-if="slotProps.data.client_supports?.revisi_2">
                  {{ formatDate(slotProps.data.client_supports?.revisi_2, 'YYYY-MM-DD') }}
                </template>
              </li>
            </ul>
          </template>
        </Column>
        <Column field="lunas" header="Lunas"></Column>
        <Column field="tutorial_password" header="Tutor+Pass">          
          <template #body="slotProps">
            {{ slotProps.data.pm_project?.tutorial_password }}
          </template>
        </Column>
        <Column field="webmaster" header="Webmaster">
          <template #body="slotProps">
            <div class="truncate w-[70px]" v-tooltip="slotProps.data.wm_project?.user?.name">
              {{ slotProps.data.wm_project?.user?.name }}
            </div>
          </template>
        </Column>
        <Column field="selesai" header="Selesai">          
          <template #body="slotProps">
            {{ slotProps.data.pm_project?.selesai }}
          </template>
        </Column>
        <Column field="act" header="Aksi">          
          <template #body="slotProps">
            <div class="flex justify-center items-center gap-1">
              <Button @click="openDialog('edit',slotProps.data)" size="small" severity="info">
                <Icon name="lucide:edit" />
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>
      <div class="flex justify-between items-center text-xs mt-3">
          <div>
            {{ data.from }} - {{ data.to }} dari {{ data.total }}
          </div>

          <Paginator
              :rows="data.per_page"
              :totalRecords="data.total"
              @page="onPaginate"
              :pt="{
                  root: (event: any) => {
                      const itemForPage =  data.per_page;
                      const currentPage =  filters.page - 1;
                      event.state.d_first = itemForPage * currentPage;
                  },
              }"
          >
          </Paginator>
        </div>
      </template>
  </Card>

  <DashLoader :loading="loading" />

  <Drawer v-model:visible="visibleDrawerFilter" header="Filters" position="right">
    <form @submit.prevent="filterSubmit">
      <ScrollPanel style="width: 100%; height: 69vh">
        <div class="flex flex-col gap-3">
          <div>
            <div class="mb-1 text-xs opacity-50">Tanggal dari</div>
            <DatePicker v-model="filters.tgl_masuk_start" placeholder="Tanggal dari" size="small" class="w-full" />
          </div>
          <div>
            <div class="mb-1 text-xs opacity-50">Tanggal sampai</div>
            <DatePicker v-model="filters.tgl_masuk_end" placeholder="Tanggal sampai" size="small" class="w-full" />
          </div>
          <div>
            <div class="mb-1 text-xs opacity-50">Nama Web</div>
            <InputText v-model="filters.nama_web" placeholder="Web" size="small" class="w-full" />
          </div>
          <div>
            <div class="mb-1 text-xs opacity-50">Paket</div>            
            <Select
              v-model="filters.paket"
              class="w-full mb-1" 
              size="small"
              placeholder="Pilih Paket" 
              :options="dataOpsiPaket"
              optionLabel="label"
              optionValue="value"
            />
          </div>
          <div>
            <div class="mb-1 text-xs opacity-50">Jenis</div>
            <Select
              v-model="filters.jenis"
              class="w-full mb-1" 
              size="small"
              placeholder="Pilih Jenis" 
              :options="dataOpsiJenis"
            />
          </div>
          <div>
            <Button type="submit" class="w-full">
              <Icon name="lucide:filter" /> Filter
            </Button>
          </div>
        </div>
      </ScrollPanel>
    </form>
  </Drawer>

  <Dialog v-model:visible="visibleDialog" modal :header="dialogAction === 'edit' ? 'Edit' : 'Detail'" :style="{ width: '60vw' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <ProjectManagerForm :data="dialogData" :action="dialogAction" />
  </Dialog>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Project Selesai',
    description: 'Daftar Project yang sudah dikerjakan',
    development: true
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute()
const client = useSanctumClient()

//get opsi jenis
const { data: dataOpsiJenis} = await useAsyncData(
    'data_opsi-jenis_project',
    () => client('/api/data_opsi/jenis_project')
) as any
//get opsi paket
const { data: dataOpsiPaket} = await useAsyncData(
    'data_opsi-paket_project',
    () => client('/api/data_opsi/paket')
) as any

const filters = ref({
    per_page: route.query.per_page || 50,
    page: route.query.page ? Number(route.query.page) : 1,
    tgl_masuk_start: route.query.tgl_masuk_start || '',
    tgl_masuk_end: route.query.tgl_masuk_end || '',
    nama_web: '',
    paket: '',
    jenis: '',
} as any);

const data = ref([] as any) ;
const loading = ref(false);
const getData = async () => {
  loading.value = true;
  data.value = [];
  try {
    const response = await client('/api/project_manager',{
      params: filters.value,
    });
    data.value = response;
    loading.value = false;
  } catch (error) {
    const er = useSanctumError(error);
    loading.value = false;
  }
  loading.value = false;
  updateRouteParams()
}
const onPaginate = (event: { page: number }) => {
    filters.value.page = event.page + 1;
    // updateRouteParams()
    getData()
};
onMounted(() => {
  getData();
})

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { ...filters.value },
  });
}

const visibleDrawerFilter = ref(false);
const filterSubmit = async () => {
    getData()
    visibleDrawerFilter.value = false;
    updateRouteParams()
}

const visibleDialog = ref(false);
const dialogData = ref({} as any);
const dialogAction = ref('')
const openDialog = (action: string, data : any) => {
  dialogAction.value = action;
  dialogData.value = data;
  visibleDialog.value = true;
}
</script>
