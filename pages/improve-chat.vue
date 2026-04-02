<template>
  <div class="space-y-2">
    
    <div class="flex items-center justify-end md:justify-between gap-1">
      <div class="flex items-center justify-end md:justify-start gap-1">
        <Select @change="refreshDataImproveChat();updateRouteParams()" v-model="filters.per_page" :options="[25,50,100,500]" size="small"/>
        <Select v-if="dataImproveChat?.kategori" @change="refreshDataImproveChat();updateRouteParams()" v-model="filters.kategori" :options="dataImproveChat.kategori" optionLabel="label" optionValue="value" size="small" placeholder="Kategori tim" showClear/>
        <InputText @change="refreshDataImproveChat();updateRouteParams()" placeholder="Search.." v-model="filters.q" size="small"/>
      </div>
      <div class="flex items-center justify-end gap-1">
        <Button @click="openDialog('add',{})" size="small">
          <Icon name="lucide:plus" /> Tambah
        </Button>
        <Button @click="refreshDataImproveChat()" size="small">
          <Icon name="lucide:refresh-cw" :class="statusDataImproveChat=='pending'?'animate-spin':''"/> Refresh
        </Button>
      </div>
    </div>
    <Card>
      <template #content>
        <DataTable :value="dataImproveChat.data" :loading="statusDataImproveChat=='pending'" size="small" class="text-sm" stripedRows scrollHeight="70vh" scrollable>
          <Column header="#" headerStyle="width:3rem">
              <template #body="slotProps">
                  <span @click="openDialog('preview',slotProps.data)" class="cursor-pointer">
                    {{ slotProps.index + dataImproveChat.from }}
                  </span>
              </template>
          </Column>
          <Column field="kategori" header="Kategori">        
              <template #body="slotProps">
                  <span @click="openDialog('preview',slotProps.data)" class="cursor-pointer">
                    {{ slotProps.data?.kategori }}
                  </span>
              </template>
          </Column>
          <Column field="nohp" header="No.HP">        
              <template #body="slotProps">
                  {{ slotProps.data.nohp }}
              </template>
          </Column>
          <Column field="masukkan" header="Masukkan">        
              <template #body="slotProps">
                  <span :title="purifyHtml(slotProps.data.masukkan)" v-html="purifyHtml(slotProps.data.masukkan)"></span>
              </template>
          </Column>
          <Column field="created_at" sortable header="Tanggal">        
            <template #body="slotProps">
                {{ formatDate(slotProps.data.created_at,'DD/MM/YY HH:mm') }}
            </template>
          </Column>
          <Column field="" header="Aksi">        
            <template #body="slotProps">
                <div class="flex justify-end items-center gap-1">
                  <Button @click="openDialog('edit',slotProps.data)" size="small">
                    <Icon name="lucide:pen" />
                  </Button>
                  <Button @click="confirmDelete(slotProps.data.id)" size="small" severity="danger">
                    <Icon name="lucide:trash-2" />
                  </Button>
                </div>
            </template>
          </Column>
          <template #empty>
            <div class="flex justify-center items-center p-2">Tidak ada data ditemukan.</div>
          </template>
        </DataTable>
        <div class="flex justify-between items-center text-xs mt-3">
            <div>
              {{ dataImproveChat.from }} - {{ dataImproveChat.to }} dari {{ dataImproveChat.total }}
            </div>
            <Paginator
                :rows="dataImproveChat.per_page"
                :totalRecords="dataImproveChat.total"
                @page="onPaginate"
                :pt="{
                    root: (event: any) => {
                        const itemForPage =  dataImproveChat.per_page;
                        const currentPage =  filters.page - 1;
                        event.state.d_first = itemForPage * currentPage;
                    },
                }"
            >
            </Paginator>
        </div>
      </template>
    </Card>

  </div>

  <Dialog v-model:visible="visibleDialog" modal :header="actionDialog=='add'?'Tambah Data':actionDialog=='edit'?'Edit Data':'Detail Data'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <form v-if="actionDialog=='add' || actionDialog=='edit'" @submit.prevent="handleFormSubmit()" class="space-y-3">

      <div class="grid grid-cols-1 md:grid-cols-5 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
        <div class="md:col-span-1">
          <label>Kategori</label>
        </div>
        <div v-if="dataImproveChat?.kategori"  class="md:col-span-4">
          <Select v-model="form.kategori" :options="dataImproveChat.kategori" optionLabel="label" optionValue="value" class="w-full" placeholder="Pilih kategori tim" showClear/>
          <Message v-if="errorsSubmit.kategori" severity="warn" class="mt-1">{{ errorsSubmit.kategori[0] }}</Message>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-5 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
        <div class="md:col-span-1">
          <label>No HP</label>
        </div>
        <div class="md:col-span-4">
          <InputText v-model="form.nohp" class="w-full" placeholder="08XX-XXXX-XXXX"/>
          <Message v-if="errorsSubmit.nohp" severity="warn" class="mt-1">{{ errorsSubmit.nohp[0] }}</Message>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
        <div class="md:col-span-1">
          <label>Masukkan</label>
        </div>
        <div class="md:col-span-4">
          <Editor v-model="form.masukkan" class="w-full" editorStyle="height: 320px">
            <template v-slot:toolbar>
                <span class="ql-formats">
                    <button v-tooltip.bottom="'Bold'" class="ql-bold"></button>
                    <button v-tooltip.bottom="'Italic'" class="ql-italic"></button>
                    <button v-tooltip.bottom="'Underline'" class="ql-underline"></button>
                </span>
            </template>
          </Editor>
          <Message v-if="errorsSubmit.masukkan" severity="warn" class="mt-1">{{ errorsSubmit.masukkan[0] }}</Message>
        </div>
      </div>

      <div class="text-end">
        <Button type="submit">
          <Icon name="lucide:save"/> Simpan
        </Button>
      </div>
    </form>

    <div v-else class="space-y-4">
      <div>
        <div class="text-sm">Kategori</div>
        <div class="bg-gray-100 dark:bg-slate-800 block rounded px-4 py-3">{{ dataDialog?.kategori }}</div>
      </div>
      <div>
        <div class="text-sm">No. HP :</div>
        <div class="bg-gray-100 dark:bg-slate-800 block rounded px-4 py-3">{{ dataDialog?.nohp }}</div>
      </div>
      <div>
        <div class="text-sm">Masukkan :</div>
        <div v-html="purifyHtml(dataDialog?.masukkan)" class="bg-gray-100 dark:bg-slate-800 block rounded px-4 py-4"></div>
      </div>
      <div class="text-sm mt-3">
        <span><Icon name="lucide:calendar"/> : {{ formatDate(dataDialog.created_at,'DD/MM/YYYY HH:mm') }}</span>
        <span class="ml-2"><Icon name="lucide:user"/> : {{ dataDialog?.user?.name }}</span>        
      </div>
    </div>

  </Dialog>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Improve Chat',
    description: 'Daftar Improve Chat',
})
import('quill')
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const client = useSanctumClient();

const filters = reactive({
    per_page: route.query.per_page?Number(route.query.per_page):Number(25),
    page: route.query.page || 1,
    kategori: route.query.kategori || '',
    q: route.query.q || '',
} as any);

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { ...filters },
  });
}

const { data: dataImproveChat, status: statusDataImproveChat, refresh: refreshDataImproveChat } = await useAsyncData(
    'improve-chat-page-'+filters.page,
    () => client('/api/improve-chat',{
        params: filters
    })
) as any
const onPaginate = (event: { page: number }) => {
    filters.page = event.page + 1;
    updateRouteParams()
    refreshDataImproveChat()
};

const toast = useToast();
const confirm = useConfirm();
const confirmDelete = (id: any) => {    
    confirm.require({
        message: 'Anda yakin hapus data ini?',
        header: 'Hapus Data',
        accept: async () => {
            toast.add({ severity: 'info', summary: 'Hapus data', detail: 'Mohon tunggu, sedang menghapus data...'});
            try {              
              await client(`/api/improve-chat/${id}`, {
                  method: 'DELETE',
              })
              toast.removeAllGroups();
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Data berhasil dihapus',
                life: 3000
              });
              refreshDataImproveChat()
            } catch (error) {
                const er = useSanctumError(error)
                toast.removeAllGroups();              
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


const form = reactive({
  id:'',
  kategori:'',
  nohp:'',
  masukkan:'',
})

const visibleDialog = ref(false);
const actionDialog = ref('add');
const dataDialog = ref({} as any);
const errorsSubmit = ref([] as any)
const openDialog = async (action: string, data = {} as any) => {
  errorsSubmit.value = []
  visibleDialog.value = true;
  actionDialog.value = action;
  dataDialog.value = data;
  if(actionDialog.value=='edit' || actionDialog.value=='preview'){
    form.kategori = data?.kategori
    form.nohp = data?.nohp
    form.masukkan = data?.masukkan
    form.id = data?.id
  } else {    
    form.kategori = 'CS'
    form.nohp = '08'
    form.masukkan = ''
    form.id = ''
  }
}

const handleFormSubmit = async () => { 
  errorsSubmit.value = []

  if(!form.kategori){
    toast.add({ severity: 'error', summary: 'Lengkapi data !', detail: 'silahkan isi kategori',life: 3000});
    return;
  }
  if(!form.masukkan){
    toast.add({ severity: 'error', summary: 'Lengkapi data !', detail: 'silahkan isi masukkan',life: 3000});
    return;
  }

  toast.add({ severity: 'secondary', summary: 'Submit data', detail: 'Mohon tunggu, sedang memproses data...'});
  try {
    await client(actionDialog.value =='add'?'/api/improve-chat':'/api/improve-chat/'+form.id,
    {
        method: actionDialog.value =='add'?'POST':'PUT',
        body: form
    }) 
    visibleDialog.value = false;
    toast.removeAllGroups();
    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: 'Data berhasil'+actionDialog.value =='add'?'ditambahkan':'diperbarui',
      life: 3000
    });
    refreshDataImproveChat()
  } catch(error : any) {
    const er = useSanctumError(error)
    errorsSubmit.value = er.bag
    toast.removeAllGroups();              
    toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: error?.response?._data?.message,
        life: 3000
    });
  }
}

</script>
