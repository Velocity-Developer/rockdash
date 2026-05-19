<template>

  <div class="flex justify-end gap-1 mb-3">
    <Button @click="getData()" size="small">
      <Icon name="lucide:refresh-cw" size="small" :class="{ 'animate-spin': loading }"/> Reload
    </Button>
    <Button @click="openDialog('add','')" size="small">
      <Icon name="lucide:plus" size="small"/> Tambah
    </Button>
  </div>
 
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    <div v-for="(item, index) in dataTable.data" :key="index">
      <Card>
        <template #content>
            <h3 class="font-bold text-lg mb-3 hover:underline" @click="navigateTo('/servers/'+item.id)">
              {{ item.name }} 
              <Icon v-if="item.is_active" name="lucide:circle-check" size="1rem" class="text-blue-500" v-tooltip="'Status : Active'"/>
              <Icon v-else name="lucide:circle-check" size="1rem" class="text-red-500" v-tooltip="'Status : Inactive'"/>
            </h3>
            <div class="text-sm opacity-75 w-full grid grid-cols-1 md:grid-cols-3 gap-2">
              <span> {{ item.hostname }} </span>
              <span> {{ item.ip_address }} </span>
              <span> {{ item.type }} </span>
            </div>
            <div class="flex items-center justify-between gap-1 mt-5">
              <Button @click="navigateTo('/servers/'+item.id)" size="small" class="w-full">
                <Icon name="lucide:info" size="small"/> Profil
              </Button>              
              <Button @click="openDialog('edit',item)" severity="contrast" size="small" class="w-full">
                <Icon name="lucide:pen" size="small"/> Edit
              </Button>
              <Button @click="confirmDelete(item.id)" severity="danger" size="small" class="w-full">
                <Icon name="lucide:trash-2" size="small"/> Hapus
              </Button>
            </div>
        </template>
      </Card>
    </div>
  </div>

  <Dialog v-model:visible="visibleDialog" :header="selectedItem ? 'Edit Server' : 'Add Server'" :style="{ width: '40rem', minHeight: '20vh' }" :breakpoints="{ '1000px': '30rem', '768px': '90vw' }" :modal="true">
    <ServerForm :action="dialogAction" :data="selectedItem" @update="getData()"/>
  </Dialog>

  <DashLoader :loading="loading"/>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Servers',
    description: 'Daftar server',
})
const route = useRoute()
const client = useSanctumClient()

const loading = ref(false)
const dataTable = ref({} as any)
const getData = async () => {
  loading.value = true
  try {
    const res = await client('/api/servers')
    loading.value = false
    dataTable.value = res
  } catch (error) {
    const er = useSanctumError(error)
    loading.value = false
  }
}
onMounted(() => {
  getData()
})

const visibleDialog = ref(false);
const dialogAction = ref('add');
const selectedItem = ref({});
const openDialog = (action : string, data = {}) => {
  visibleDialog.value = true
  dialogAction.value = action

  if(data) {
    selectedItem.value = data
  } else {
    selectedItem.value = {}
  }
}

const toast = useToast();
const confirm = useConfirm();
const confirmDelete = (id: any) => {    
    confirm.require({
        message: 'Anda yakin hapus server ini?',
        header: 'Hapus server',
        accept: async () => {
            try {              
              const re = await client(`/api/servers/${id}`, {
                  method: 'DELETE',
              })
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'server berhasil dihapus',
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