<template>

  <div class="flex justify-between items-center mb-3">
    <div class="font-bold">
      {{ props.tanggal }}
    </div>
    <Button @click="visibleDialog = true" size="small">
      <Icon name="lucide:plus-circle" /> Tambah
    </Button>
  </div>

  <div v-if="dataClientSupport && dataClientSupport.count > 0" class="overflow-x-auto text-sm">
    
    <div v-for="(item_layanan,i) in dataClientSupport.data" :key="i" class="space-y-4 mb-4">
      <div>
        <div class="md:text-md font-bold mb-2">
          {{ labelLayanan(i) }}
        </div>
        <div class="space-y-2">
          <div 
            v-for="(item,index) in item_layanan" :key="index" 
            class="flex justify-between items-center border dark:border-gray-700 px-4 py-2 rounded-md hover:shadow transition-all hover:bg-primary-50 dark:hover:bg-gray-700"
          >
            <div>
              <div>{{ item.nama_web }}</div> 
              <div class="text-xs text-primary-500" v-if="item.jenis">                
                {{ item.jenis }}
              </div>
            </div>
            <div>
              <Button @click="handleDelete(item)" size="small" severity="danger" >
                <Icon name="lucide:x" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>

  <Dialog 
    v-model:visible="visibleDialog" modal 
    :header="'Tambah'" 
    :style="{ width: '30rem' }" 
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <ClientSupportAdd :tanggal="props.tanggal" @submit="visibleDialog = false;getData()"/>
  </Dialog>

  <ProgressBar v-if="loading" mode="indeterminate" style="height: 6px"></ProgressBar>

</template>

<script setup lang="ts">
const props = defineProps({
  tanggal: {
    type: String,
    default: () => '',
  },
})
const emit = defineEmits(['update'])
const client = useSanctumClient()
const toast = useToast()
const confirm = useConfirm()

const dataClientSupport = ref<any>({})
const loading = ref(false)
const getData = async () => {
  try {
    loading.value = true
    const res = await client(`/api/client_support_by_tgl/${props.tanggal}`) as any
    dataClientSupport.value = res
  } catch (error) {
    console.log(error)
    loading.value = false
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getData()
})

const labelLayanan = (i: any) => {
  if(i === 'revisi_1') {
    return 'Revisi 1'
  } else if(i === 'perbaikan_revisi_1') {
    return 'Perbaikan Revisi 1'
  } else if(i === 'revisi_2') {
    return 'Revisi 2'
  } else if(i === 'perbaikan_revisi_2') {
    return 'Perbaikan Revisi 2'
  } else if(i === 'tanya_jawab') {
    return 'Tanya Jawab'
  } else if(i === 'update_web') {
    return 'Update Web'
  }
}

const visibleDialog = ref(false)

const handleDelete = (item: any) => {
    confirm.require({
        message: 'Anda yakin hapus data support ini?',
        header: 'Hapus data',
        accept: async () => {
            try {
              loading.value = true
              await client(`/api/client_support/destroy`,{
                method: 'DELETE',
                params: {
                  id: item.id,
                  tanggal: props.tanggal,
                  layanan: item.layanan
                }
              })    
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Data berhasil dihapus',
                life: 3000
              });
              getData()
              emit('update')
            } catch (error) {
              console.log(error)
              toast.add({
                severity: 'error',
                summary: 'Gagal menghapus data',
                life: 3000
              })
            } finally {
              loading.value = false
            }
        },
        rejectProps: {
            label: 'Batal',
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
