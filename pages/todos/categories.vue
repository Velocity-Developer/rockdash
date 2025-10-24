<template>
  <div class="md:max-w-[50rem] md:mx-auto">
    <div class="flex justify-end items-center gap-2 mb-2">
      <Button @click="openFormDialog('add','')" size="small" :loading="loading">
        <Icon name="lucide:plus" />
        Tambah
      </Button>
      <Button @click="getData()" size="small" :loading="loading">
        <Icon name="lucide:refresh-ccw" :class="{ 'animate-spin':loading }" />
        Refresh
      </Button>
    </div>

    <Card>
      <template #content>

        <div>
          <DataTable :value="data.data" class="text-sm">
            <Column field="name" header="Name">
              <template #body="slotProps">
                <div class="flex items-center gap-2">
                  <span v-if="slotProps.data.icon" class="w-9 h-9 text-lg shadow hover:shadow-lg flex items-center justify-center rounded-full" :style="{ backgroundColor: slotProps.data.color || '#ffffff' }">
                    {{slotProps.data.icon}}
                  </span>
                  <span class="inline-block">
                    {{slotProps.data.name}}
                  </span>
                </div>
              </template>
            </Column>
            <Column field="color" header="Color">
              <template #body="slotProps">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded border border-gray-300" :style="{ backgroundColor: slotProps.data.color || '#ffffff' }"></div>
                  <span>{{slotProps.data.color || '#ffffff'}}</span>
                </div>
              </template>
            </Column>
            <Column field="description" header="Desc" />
            <Column field="action" header="">
              <template #body="slotProps">
                <div class="flex justify-end items-center gap-1">
                  <Button @click="openFormDialog('edit',slotProps.data)" size="small" severity="info">
                    <Icon name="lucide:edit" />
                  </Button>
                  <Button @click="deleteItem(slotProps.data.id)" size="small" severity="danger">
                    <Icon name="lucide:trash-2" />
                  </Button>
                </div>
              </template>
            </Column>
          </DataTable>
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
      </template>
    </Card>
  </div>

  <Dialog v-model:visible="visibleFormDialog" modal :header="actionFormDialog === 'add' ? 'Tambah Kategori Todo' : 'Edit Kategori Todo'" :style="{ width: '25rem' }">
    <TodoFormCategory :action="actionFormDialog" :item="selectedItem" @update="getData"/>
  </Dialog>

  <DashLoader :loading="loading" />

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Kategori Todo',
    description: 'Daftar Kategori Todo',
})
const client = useSanctumClient();
const route = useRoute();
const confirm = useConfirm();
const toast = useToast();

const filters = reactive({
  page: route.query.page ? Number(route.query.page) : 1,
})

const loading = ref(false);
const data = ref({} as any);
const getData = async () => {
    loading.value = true;
    try {
      const res = await client('/api/todo_category',{
        params: filters,
      }) as any
      data.value = res;
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
}
const onPaginate = (event: { page: number }) => {
    filters.page = event.page + 1;
    getData()
};
onMounted(() => {
    getData();
})

const visibleFormDialog = ref(false);
const actionFormDialog = ref('add');
const selectedItem = ref();
const openFormDialog = (action:string,item:any) => {
  visibleFormDialog.value = true;
  actionFormDialog.value = action;
  selectedItem.value = item;
}

const deleteItem = async (id:number) => {
  confirm.require({
        message: 'Apakah Anda yakin ingin menghapus kategori ini?',
        header: 'Hapus Kategori',
        rejectLabel: 'Cancel',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Delete',
            severity: 'danger'
        },
        accept: async () => {
          try {
            await client(`/api/todo_category/${id}`,{
              method: 'DELETE',
            })
            toast.add({ severity: 'success', summary: 'Success', detail: 'Kategori todo berhasil dihapus', life: 3000 });
            getData()
          } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus kategori todo', life: 3000 });
          }
        }
    });
}
</script>
