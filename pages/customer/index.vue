<template>
  
  <div class="w-full flex flex-col md:flex-row gap-2 md:justify-between items-end text-xs mb-5">
    <form @submit.prevent="refresh();updateRouteParams()" class="hidden md:flex items-end gap-2">
      <div>
        <div class="mb-1 opacity-50">Per Page : </div>            
        <InputText type="number" v-model="filters.per_page" placeholder="per Page" size="small" class="w-[70px] shadow rounded" />
      </div>
      <div>
        <div class="mb-1 opacity-50">Cari</div>
        <InputText v-model="filters.q" placeholder="Nama, Email, HP" size="small" class="w-[200px] shadow rounded"/>
      </div>
      <div>
        <Button type="submit" size="small" severity="info" class="shadow-md">
          Go
        </Button>
      </div>
    </form>

    <div class="flex justify-end items-center gap-2">
      <Button @click="openDialog('add')" size="small" class="shadow-md">
        <Icon name="lucide:plus-circle" /> <span class="hidden md:inline-block">Tambah</span>
      </Button>
      <Button @click="visibleDrawerFilter = true" size="small" severity="info" class="shadow-md">
        <Icon name="lucide:filter" /> <span class="hidden md:inline-block">Filter</span>
        <span
        class="w-2 h-2 bg-yellow-300 rounded-full inline-block absolute top-0 right-0 m-1"
        v-if="filters.nama || filters.email || filters.hp || filters.alamat"
        ></span>
      </Button>
    </div>
  </div>

  <Card>
    <template #content>

      <Message class="w-[14rem] mb-2 shadow hover:shadow-md" severity="info">
        <div class="text-xs">
          Total Customer: <span class="font-bold">{{ data.total }}</span>
        </div>
      </Message>

      <DataTable @sort="handleSortTable" :value="data.data" size="small" class="text-xs" v-model:selection="selectedRows" stripedRows scrollHeight="70vh" scrollable>
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column header="#" headerStyle="width:3rem">
          <template #body="slotProps">
              {{ slotProps.index + data.from }}
          </template>
        </Column>
        <Column field="nama" header="Nama" sortable>
          <template #body="slotProps">
            <div class="group relative py-1">
              <NuxtLink :to="'/customer/'+slotProps.data.id" class="hover:underline block">
                {{ slotProps.data.nama }}
              </NuxtLink>
              <div class="invisible group-hover:visible absolute bottom-[-1rem] inset-x-0 flex item-center">
                <Button @click="openDialog('edit',slotProps.data)" class="!text-xs !px-1 !py-0" variant="text" severity="info" size="small">
                  <Icon name="lucide:pencil" /> Edit
                </Button>
                <Button @click="confirmDelete(slotProps.data.id)" class="!text-xs !px-1 !py-0" variant="text" severity="danger" size="small">
                  <Icon name="lucide:trash-2" /> Hapus
                </Button>
              </div>
            </div>
          </template>
        </Column>
        <Column field="email" header="Email">
          <template #body="slotProps">
            <div class="whitespace-normal">
              {{ split_comma(slotProps.data.email) }}
            </div>
          </template>
        </Column>
        <Column field="hp" header="No. HP">
          <template #body="slotProps">
            <div class="whitespace-normal">
              {{ split_comma(slotProps.data.hp) }}
            </div>
          </template>
        </Column>
        <Column field="alamat" header="Alamat">
          <template #body="slotProps">
            <div class="max-w-[200px] whitespace-normal">
              {{ slotProps.data.alamat }}
            </div>
          </template>
        </Column>
        <Column field="created_at" sortable header="Tanggal Dibuat">        
          <template #body="slotProps">
              {{ formatTanggal(slotProps.data.created_at) }}
          </template>
        </Column>
        <Column field="act" header="">
          <template #body="slotProps">
            <div class="flex item-center gap-1 justify-end">
              <Button @click="openDialog('edit',slotProps.data)" severity="info" size="small">
                <Icon name="lucide:pencil" />
              </Button>
              <Button @click="confirmDelete(slotProps.data.id)" severity="danger" size="small">
                <Icon name="lucide:trash-2" />
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
                    const currentPage =  page - 1;
                    event.state.d_first = itemForPage * currentPage;
                },
            }"
        >
        </Paginator>
      </div>
    </template>
  </Card>

  <Drawer v-model:visible="visibleDrawerFilter" header="Filters" position="right">
    <form @submit.prevent="filterSubmit">

      <ScrollPanel style="width: 100%; height: 69vh">
        <div v-for="item in fieldsFilter" class="mb-3 md:mb-4">
          <label class="mb-1 block text-sm" :for="item.key">
            {{ item.label }}
          </label>

          <InputText 
            v-model="filters[item.key]"
            :id="item.key" 
            class="w-full" 
            :placeholder="item.label" 
            size="small"
          />
        </div>
        
        <div class="mb-5">
          <div class="mb-1 text-sm">Per Page : </div>            
          <InputText type="number" v-model="filters.per_page" placeholder="per Page" size="small" class="w-full" />
        </div>
      </ScrollPanel>
      
      <div>
        <Button type="submit" class="w-full shadow">
          <Icon name="lucide:filter" /> Filter
        </Button>
        <Button @click="resetFilters()" severity="contrast" class="w-full mt-3 shadow">
          <Icon name="lucide:x" /> Reset
        </Button>
      </div>
    </form>
  </Drawer>

  <Dialog v-model:visible="visibleDialog" modal :header="actionDialog=='add'?'Tambah Customer':'Edit Customer'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <CustomerForm :action="actionDialog" :data="dataDialog" @update="refresh()" />
  </Dialog>

  <DashLoader :loading="isLoadingDash"/>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Customer',
    description: 'Daftar Customer',
})
import { useDayjs } from '#dayjs'
import { formatDate } from '~/utils/formatDate'
const dayjs = useDayjs()
const route = useRoute();
const client = useSanctumClient();

const page = ref(route.query.page ? Number(route.query.page) : 1);

const filters = reactive({
    per_page: route.query.per_page || 50,
    page: computed(() => page.value),
    q: route.query.q || '',
    nama: '',
    email: '',
    hp: '',
    alamat: '',
    order_by: 'created_at',
    order: 'desc',
} as any);

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { ...filters },
  });
}

const { data, status, error, refresh } = await useAsyncData(
    'customer-page-'+page.value,
    () => client('/api/customer',{
        params: filters
    })
) as any
const onPaginate = (event: { page: number }) => {
    page.value = event.page + 1;
    updateRouteParams()
    refresh()
};

//watch status
const isLoadingDash = ref(false)
watch(status, (newValue, oldValue) => {
    if(newValue == 'success') {
      isLoadingDash.value = false;
    } else {
      isLoadingDash.value = true;
    }
})

const visibleDrawerFilter = ref(false);
const filterSubmit = async () => {
    refresh()
    visibleDrawerFilter.value = false;
    updateRouteParams()
}
const fieldsFilter = [
  { key: 'nama', label: 'Nama', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'hp', label: 'No. HP', type: 'text' },
  { key: 'alamat', label: 'Alamat', type: 'text' },
]

//reset filters
function resetFilters() {
  filters.per_page = 50;
  filters.q = '';
  filters.nama = '';
  filters.email = '';
  filters.hp = '';
  filters.alamat = '';
  updateRouteParams()
  refresh()
  visibleDrawerFilter.value = false;
}

//handeSortTable
function handleSortTable(event: any) {
  const sortField = event.sortField;
  const sortOrder = event.sortOrder;
  filters.order_by = sortField;
  filters.order = sortOrder==1?'asc':'desc';
  updateRouteParams()
  refresh()
}

const selectedRows = ref();
const selectedRowsNama = ref('');
//watch
watch(selectedRows, (newValue, oldValue) => {
  if(newValue.length > 0) {
    //set selectedRowsNama array, join dengan enter
    selectedRowsNama.value = newValue.map((item: any) => item.nama).join(', ');
  }
})

//copy selectedRowsNama ke clipboard
function copyToClipboard() {
  navigator.clipboard.writeText(selectedRowsNama.value);
  alert('Nama Customer berhasil di copy ke clipboard');
}

const visibleDialog = ref(false);
const actionDialog = ref('add');
const dataDialog = ref({});
const openDialog = async (action: string, data = {}) => {
  visibleDialog.value = true;
  actionDialog.value = action;
  dataDialog.value = data;
}

const toast = useToast();
const confirm = useConfirm();
const confirmDelete = (id: any) => {    
    confirm.require({
        message: 'Anda yakin hapus data ini?',
        header: 'Hapus Data',
        accept: async () => {
            try {              
              const re = await client(`/api/customer/${id}`, {
                  method: 'DELETE',
              })
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Data berhasil dihapus',
                life: 3000
              });
              refresh()
            } catch (error) {
                const er = useSanctumError(error)                 
                toast.add({
                    severity: 'error',
                    summary: 'Gagal!',
                    detail: er.msg ? er.msg : 'Terjadi kesalahan saat menghapus data',
                    life: 3000
                });
            }
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

// Format tanggal
function formatTanggal(tanggal: string) {
  return formatDate(tanggal, 'DD/MM/YYYY');
}

function split_comma(text: string) {
  return text?text.split(',').join('\n'):'';
}
</script>

<style scoped></style>
