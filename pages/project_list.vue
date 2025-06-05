<template>

  <div class="mb-3">
    <SelectButton 
    v-model="filters.jenis_project" 
    :options="[{label:'Semua',value:0},{label:'Biasa',value:10},{label:'Custom',value:12},{label:'Lainnya',value:23}]"
    optionLabel="label" optionValue="value"
    />
  </div>

  <DataTable :value="data.data" size="small" class="text-xs" stripedRows scrollHeight="75vh" scrollable>
      <!-- <Column selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
      <Column header="No" headerStyle="width:3rem">
        <template #body="slotProps">
            {{ slotProps.index + 1 }}
        </template>
      </Column>
      <Column field="webhost.nama_web" header="Nama Web">
        <template #body="slotProps">
          <a :href="'https://'+slotProps.data.webhost.nama_web" target="_blank" class="group hover:underline">
            {{ slotProps.data.webhost.nama_web }} 
            <Icon name="lucide:external-link" class="ml-1 hidden group-hover:inline-block"/>
          </a>
        </template>
      </Column>
      <Column field="jenis" header="Jenis"></Column>
      <Column field="webhost.paket.paket" header="Paket"></Column>
      <Column field="deskripsi" header="Deskripsi">
        <template #body="slotProps">
          <div class="max-w-[150px] whitespace-normal">
            {{ slotProps.data.deskripsi }}
          </div>
        </template>
      </Column>
      <Column field="tgl_deadline" sortable header="Deadline">       
        <template #body="slotProps">
            {{ formatTanggal(slotProps.data.tgl_deadline) }}
        </template>
      </Column>
      <Column field="catatan" header="Catatan">
        <template #body="slotProps">
          <div class="max-w-[200px] break-all whitespace-normal pr-1">
            {{ slotProps.data.wm_project?.catatan }}
          </div>
        </template>
      </Column>
      <Column field="user" header="User">       
        <template #body="slotProps">
          <template v-if="slotProps.data.wm_project">
            <span>{{slotProps.data.wm_project.webmaster}}</span>
            <ProgressBar v-if="slotProps.data.wm_project.progress" :value="slotProps.data.wm_project.progress" class="text-xs"/>
          </template>
        </template>
      </Column>
      <Column field="status" header="Status">       
        <template #body="slotProps">
          <template v-if="slotProps.data.wm_project">

            <span
              v-if="slotProps.data.wm_project.status_multi === 'selesai'"
              v-tooltip="slotProps.data.wm_project.date_selesai ? 'Selesai' : slotProps.data.wm_project.status_multi"
            >
              <Icon
                :name="slotProps.data.wm_project.date_selesai ? 'lucide:circle-check' : 'lucide:clock-fading'"
                size="1.5rem"
                :class="slotProps.data.wm_project.date_selesai ? 'text-green-500' : 'text-amber-500'"
              />
            </span>

            <span
              v-else-if="slotProps.data.wm_project.status_multi === 'pending' && slotProps.data.wm_project.date_selesai"
              v-tooltip="'Proses Koreksi'"
            >
              <Icon name="lucide:loader" size="1.5rem" class="text-blue-500" />
            </span>

            <span
              v-else
              v-tooltip="slotProps.data.wm_project.status_multi"
            >
              <Icon name="lucide:clock-fading" size="1.5rem" class="text-amber-500" />
            </span>


          </template>
        </template>
      </Column>
      <Column field="act" header="">       
        <template #body="slotProps">
          <Button v-if="slotProps.data.wm_project" severity="contrast" size="small" class="text-xs">
            Edit
          </Button>
          <Button v-else size="small" class="text-xs">
            Ambil
          </Button>
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

  <DashLoader :loading="loading"/>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Daftar Project',
    description: 'Daftar Project yang dikerjakan',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient();

const route = useRoute();

//dapatkan default filters.jenis_project
const getInitialJenisProject = () => {
  const fromRoute = Number(route.query.jenis_project)
  if (!isNaN(fromRoute) && fromRoute !== 0) return fromRoute

  const fromStorage = Number(localStorage.getItem('project_list.jenis_project'))
  if (!isNaN(fromStorage) && fromStorage !== 0) return fromStorage

  return 12
}

const filters = ref({
  page: Number(route.query.page) || 1,
  jenis_project: getInitialJenisProject(),
})

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
  loading.value = true;
  try {
    const response = await client('/api/project_list',{
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
const onPaginate = (event: { page: number }) => {
    filters.value.page = event.page + 1;
    updateRouteParams()
    getData()
};

onMounted(() => {
  getData();
})

//watch filters.jenis_project
watch(() => filters.value.jenis_project, (newVal, oldVal) => {
  //simpan ke local storage
  localStorage.setItem('project_list.jenis_project', newVal.toString())
  updateRouteParams()
  getData()
})

</script>
