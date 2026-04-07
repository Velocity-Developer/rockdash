<template>
  <div class="space-y-3">

    <div v-if="loadingSubmitSearch || loadingWebhostManual" class="card flex justify-center">
        <ProgressSpinner />
    </div>

    <Message v-if="dataSearch && dataSearch.auto_assigned" class="mt-1 mb-5">
        <div class="flex justify-center items-center gap-5">
          <Icon name="lucide:check-check" size="2rem" class="text-teal-500"/> <span>Domain berhasil sync dengan webhost otomatis</span>
        </div>
    </Message>

    <Message v-if="dataSearch && dataSearch.whmcs_domain && !dataSearch.auto_assigned" severity="warn" class="mt-1 mb-5">
        <div class="flex justify-center items-center gap-5">
          <Icon name="lucide:x" size="2rem" class="text-red-500"/> <span>Webhost tidak ditemukan otomatis untuk domain ini</span>
        </div>
    </Message>

    <div v-if="dataSearch && dataSearch.data && dataSearch.data.length > 0 && dataSearch.auto_assigned" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      <div v-for="item,i in labelWebhost" :key="i" class="space-y-1">
        <div>{{ item.label }}</div>
        <div class="bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded">
          {{ dataSearch.data[0][item.key] }}
        </div>
      </div>
    </div>

    <div 
      v-if="dataSearch && dataSearch.whmcs_domain && !dataSearch.auto_assigned && dataSearch.data"
      class="border border-teal-200 dark:border-teal-700 p-4 rounded mt-10 shadow"
    >
    <div class="mb-8">      
      <div class="font-bold text-teal-900 dark:text-teal-100 mb-3">
        Data WHMCS domain
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div>
          <div class="text-sm">Domain :</div>
          {{ dataSearch.whmcs_domain.domain || '-' }}
        </div>
        <div>
          <div class="text-sm">Email :</div>
          {{ dataSearch.whmcs_domain.user_email || '-' }}
        </div>
        <div>
          <div class="text-sm">Tanggal registrasi :</div>
          {{ dataSearch.whmcs_domain.registrationdate || '-' }}
        </div>
        <div>
          <div class="text-sm">Tanggal expired :</div>
          {{ dataSearch.whmcs_domain.expirydate || '-' }}
        </div>
      </div>
    </div>
    <div class="font-bold text-teal-900 dark:text-teal-100 mb-3">
      Rekomendasi webhost yang ditemukan:
    </div>
      <DataTable
          :value="dataSearch.data"
          size="small"
          class="text-sm"
          stripedRows
        >
          <Column header="#" headerStyle="width:4rem">
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>
          <Column field="nama_web" header="Domain" headerStyle="min-width:16rem">
            <template #body="slotProps">             
              <a :href="`/webhost/${slotProps.data.id_webhost}`" target="_blank" class="group hover:text-teal-500">
                {{ slotProps.data.nama_web || '-' }}
                <Icon name="lucide:arrow-right" size="0.75rem" class="hidden group-hover:inline-block ml-2"/>
              </a>
            </template>
          </Column>
          <Column field="email" header="Email">
            <template #body="slotProps">              
              {{ slotProps.data.email || '-' }}
            </template>
          </Column>
          <Column field="hp" header="HP">
            <template #body="slotProps">              
              {{ slotProps.data.hp || '-' }}
            </template>
          </Column>          
          <Column field="act" header="Aksi">
            <template #body="slotProps">      
              <Button @click="selectWebhostManual(slotProps.data)" size="small">
                <Icon name="lucide:globe" size="0.75rem" class="mr-1"/> Pilih Webhost
              </Button>
            </template>
          </Column>
          <template #empty>
            <div class="flex items-center justify-center gap-5 py-6">Tidak ada rekomendasi webhost yang ditemukan !</div>
          </template>
      </DataTable>
    </div>

  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const client = useSanctumClient()
const confirm = useConfirm()

const emit = defineEmits(['update', 'close'])

const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
})

const labelWebhost = [
  {
    label:'Website',
    key: 'nama_web',
  },
  {
    label:'Email',
    key: 'email',
  },
  {
    label:'HP',
    key: 'hp',
  },
  {
    label:'WA',
    key: 'wa',
  },
  {
    label:'Tanggal Mulai',
    key: 'tgl_mulai',
  }
]

const dataSearch = ref({} as any)
const loadingSubmitSearch = ref(false)
const submitSearch = async () => {
  loadingSubmitSearch.value = true
  try {
    const response = await client(`/api/whmcs-domain-webhost-search`, {
      method: 'POST',
      body: { 
        id: props.data.id,
        domain: props.data.domain,
        email: props.data.user_email,
      },
    }) as any
    dataSearch.value = response
    
    if(response.auto_assigned){
      emit('update')
    }
  } catch(error){
    console.log(error)
  } finally {
    loadingSubmitSearch.value = false
  }
}

onMounted(() => {
  submitSearch()
})

const loadingWebhostManual = ref(false)
const selectWebhostManual = (item: any) => {
    confirm.require({
        message: 'Anda yakin pilih webhost ini?',
        header: 'Pilih Webhost',
        accept: async () => {
            try {
              loadingWebhostManual.value = true
              await client(`/api/whmcs-domain-webhost-select`,{
                method: 'POST',
                body: {
                  id: props.data.id,
                  webhost_id: item.id_webhost
                }
              })    
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Webhost berhasil dipilih',
                life: 3000
              });
              emit('update')
            } catch (error) {
              console.log(error)
              toast.add({
                severity: 'error',
                summary: 'Gagal memilih webhost',
                life: 3000
              })
            } finally {
              loadingWebhostManual.value = false
            }
        },
        rejectProps: {
            label: 'Batal',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Ya',
            severity: 'primary',
            outlined: false
        },
        reject: () => {
            //callback to execute when user rejects to delete
        }
    });
}
</script>