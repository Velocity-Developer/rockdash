<template>
  <div class="space-y-3">

    <div v-if="loadingSubmitSearch" class="card flex justify-center">
        <ProgressSpinner />
    </div>

    <div v-if="dataSearch && dataSearch.auto_assigned" class="card flex justify-center items-center gap-5 mb-5">
        <Icon name="lucide:check-check" size="3rem" class="text-teal-500"/> <span>Domain berhasil sync dengan webhost</span>
    </div>

    <div v-if="dataSearch && dataSearch.whmcs_domain && !dataSearch.auto_assigned" class="card flex justify-center items-center gap-5 mb-5">
        <Icon name="lucide:x" size="3rem" class="text-red-500"/> <span>Webhost tidak ditemukan untuk domain ini</span>
    </div>

    <div v-if="dataSearch && dataSearch.data && dataSearch.data.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      <div v-for="item,i in labelWebhost" :key="i" class="space-y-1">
        <div>{{ item.label }}</div>
        <div class="bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded">
          {{ dataSearch.data[0][item.key] }}
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const client = useSanctumClient()

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
</script>