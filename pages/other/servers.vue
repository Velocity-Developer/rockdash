<template>

  <div class="flex justify-end gap-1">
    <Button @click="getData()" size="small">
      <Icon name="lucide:refresh-cw" size="small" :class="{ 'animate-spin': loading }"/> Reload
    </Button>
    <Button @click="openDialog('add','')" size="small">
      <Icon name="lucide:plus" size="small"/> Tambah
    </Button>
  </div>

  <div v-if="dataTable.data" class="mt-5">
    <DataTable :value="dataTable.data" size="small" class="text-sm" stripedRows scrollable>
      <Column field="name" header="Name"></Column>
      <Column field="type" header="Type"></Column>
      <Column field="ip_address" header="IP Address"></Column>
      <Column field="hostname" header="Hostname"></Column>
      <Column field="port" header="Port"></Column>
      <Column field="is_active" header="Active">
        <template #body="slotProps">
          <Icon v-if="slotProps.data.is_active" name="lucide:check" size="small" class="text-green-600"/>
          <Icon v-else name="lucide:x" size="small" class="text-red-600"/>
        </template>
      </Column>
      <Column field="options" header="Options"></Column>
      <Column field="opt" header="">
        <template #body="slotProps">
          <div class="flex justify-end items-center gap-1">
            <Button @click="openDialog('edit',slotProps.data)" severity="secondary" size="small">
              <Icon name="lucide:pen" size="small"/>
            </Button>
            <Button @click="confirmDelete(slotProps.data.id)" severity="danger" size="small">
              <Icon name="lucide:trash-2" size="small"/>
            </Button>
          </div>
        </template>
      </Column>
    </DataTable>
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