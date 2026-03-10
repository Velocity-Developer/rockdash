<template>
  <div class="space-y-4">
    
    <form @submit.prevent="refresh()" class="flex justify-end items-end gap-1">
      <InputText v-model="filters.search" placeholder="Cari user.." class="w-40" size="small"/>
      <Select @change="refresh()" v-model="filters.per_page" :options="[20,50,100]" size="small"/>
      <Button type="submit" size="small" severity="info">
        <Icon name="lucide:refresh-cw" :class="status==='pending'?'animate-spin':''" /> Refresh
      </Button>
    </form>

    <Card>
      <template #content>
        <DataTable :value="data.data" size="small" class="text-xs" stripedRows scrollHeight="80vh" scrollable>
          <Column header="#" headerStyle="width:3rem">
            <template #body="slotProps">
                {{ data.from + slotProps.index }}
            </template>
          </Column>
          <Column field="firstname" header="Firstname">
            <template #body="slotProps">
              <span @click="openPreviewDialog(slotProps.data)" class="cursor-pointer">
                {{ slotProps.data.firstname }}
              </span>
            </template>
          </Column>
          <Column field="lastname" header="Lastname">
            <template #body="slotProps">
              <span @click="openPreviewDialog(slotProps.data.id)" class="cursor-pointer">
                {{ slotProps.data.lastname }}
              </span>
            </template>
          </Column>
          <Column field="email" header="Email"></Column>
          <Column header="" headerStyle="width:3rem">
            <template #body="slotProps">
                <div class="flex justify-end items-center gap-1">
                  <Button size="small" severity="info" @click="openDialog('edit', slotProps.data)">
                    <Icon name="lucide:edit" />
                  </Button>
                  <Button size="small" severity="danger" @click="deleteItem(slotProps.data)">
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

  </div>

  <Dialog v-model:visible="visibleDialog" modal :header="actionDialog=='add'?'Tambah':'Edit'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <WhmcsUserForm :action="actionDialog" :id="idDialog" @submit="refresh();visibleDialog = false" @close="refresh();visibleDialog = false"/>
  </Dialog>
  
  <Dialog v-model:visible="visiblePreviewDialog" modal :header="headerPreviewDialog" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <WhmcsUserPreview :id="idPreviewDialog"/>
  </Dialog>

  <DashLoader :loading="loading || status === 'pending'"/>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Data Users WHMCS',
    description: 'Whmcs Users',
})
const route = useRoute();
const confirm = useConfirm()
const toast = useToast()
const client = useSanctumClient();
const page = ref(route.query.page ? Number(route.query.page) : 1);
const filters = reactive({
    per_page: route.query.per_page?Number(route.query.per_page):50,
    page: computed(() => page.value),
    search: '',
    order_by: 'id',
    order: 'desc',
} as any);

const { data, status, error, refresh } = await useAsyncData(
    'whmcs-user-page-'+page.value,
    () => client('/api/whmcs-user',{
        params: filters
    })
) as any
const onPaginate = (event: { page: number }) => {
    page.value = event.page + 1;
    updateRouteParams()
    refresh()
};

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { ...filters },
  });
}

const loading = ref(false)
const deleteItem = (item: any) => {
    confirm.require({
        message: `Anda yakin hapus data user : ${item.firstname} ${item.lastname}?`,
        header: 'Hapus data',
        accept: async () => {
            try {
              loading.value = true
              await client(`/api/whmcs-user/${item.id}`,{
                method: 'DELETE'
              })    
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Data berhasil dihapus',
                life: 3000
              });
              refresh()
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

const visibleDialog = ref(false)
const actionDialog = ref<'add' | 'edit'>('add')
const idDialog = ref<number>(0)
const openDialog = (action: 'add' | 'edit' = 'add', data: any = null) => {
  actionDialog.value = action
  visibleDialog.value = true
  idDialog.value = data?.id || 0
}

const visiblePreviewDialog = ref(false)
const idPreviewDialog = ref<number>(0)
const headerPreviewDialog = ref<string>('Preview User')
const openPreviewDialog = (data: any = null) => {
  visiblePreviewDialog.value = true
  idPreviewDialog.value = data?.id || 0
  headerPreviewDialog.value = data?.firstname ? `${data.firstname} ${data.lastname}` : 'Preview User'
}
</script>
