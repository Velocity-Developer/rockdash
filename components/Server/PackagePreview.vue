<template>
  
  <div>
    <div v-for="item in fields" :key="item.key" class="flex flex-col md:flex-row py-2">
      <div class="md:basis-1/4 mb-1">{{ item.label }}</div>
      <div class="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded h-[2rem] w-full">
        
        <template v-if="item.key == 'updated_at'">
          {{ dayjs(data[item.key]).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="item.key == 'server'">
          {{ data[item.key]?.name }}
        </template>
        <template v-else>
          {{ data[item.key] }}
        </template>

      </div>
    </div>
    <div class="flex justify-end item-center gap-1 mt-4">
      <Button severity="danger" @click="confirmDelete()" :loading="loading">
        <Icon name="lucide:trash-2"/> Hapus
      </Button>
      <Button @click="syncData()" :loading="loading" v-tooltip="'Sinkronkan data dari server'">
        <Icon name="lucide:globe" :class="{ 'animate-spin': loading }"/> Sync
      </Button>
    </div>
  </div>

</template>

<script setup lang="ts">
const props = defineProps({
  package: {
    type: Object,
    required: true,
  },
  server: {
    type: Number,
    required: true,
  }
})
const emit = defineEmits(['update','delete'])
const client = useSanctumClient()
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()

const fields = [
  { key:'name', label: 'Name'},
  { key:'server', label: 'Server'},
  { key:'bandwidth', label: 'Bandwidth'},
  { key:'email_daily_limit', label: 'Email Daily Limit'},
  { key:'inode', label: 'Inode'},
  { key:'quota', label: 'quota'},
  { key:'updated_at', label: 'Last Update'},
]

const loading = ref(false)
const data = ref({} as any)
const getData = async () => {
  loading.value = true
  try {
    loading.value = true
    const res = await client('/api/server_packages/'+props.package.id)
    loading.value = false
    data.value = res
  } catch (error) {
    const er = useSanctumError(error)
    loading.value = false
  }
}
onMounted(() => {
  getData()
})


const syncData = async () => {
  loading.value = true
  try {
    loading.value = true
    const res = await client('/api/servers_sync_package_detail/'+props.package.id)
    loading.value = false
    data.value = res
    emit('update')
  } catch (error) {
    const er = useSanctumError(error)
    loading.value = false
  }
}

const toast = useToast();
const confirm = useConfirm();
const confirmDelete = () => {    
    confirm.require({
        message: 'Anda yakin hapus package ini?',
        header: 'Hapus Package',
        accept: async () => {
            try {              
              const re = await client(`/api/server_packages/${props.package.id}`, {
                  method: 'DELETE',
              })
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Package server berhasil dihapus',
                life: 3000
              });
              emit('update')
              emit('delete')
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

