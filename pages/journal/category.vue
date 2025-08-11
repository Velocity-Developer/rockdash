<template>

  <Card class="md:max-w-[50rem] md: mx-auto">
    <template #content>
      
      <div class="flex justify-end items-center gap-2 mb-2">
        <Select 
          v-model="filters.role" 
          :options="opsiRoles" 
          optionLabel="label" 
          optionValue="value" 
          placeholder="Semua Role" 
          :loading="loadingRole"
          size="small"
          @change="getData"
        />
        <Button @click="openFormDialog('add','')" size="small" :loading="loading">
          <Icon name="lucide:plus" />
          Tambah
        </Button>
        <Button @click="getData()" size="small" :loading="loading">
          <Icon name="lucide:refresh-ccw" :class="{ 'animate-spin':loading }" />
          Refresh
        </Button>
      </div>
      

      <div>
        <DataTable :value="data.data" class="text-sm">
          <Column field="name" header="Name">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <span v-if="slotProps.data.icon" class="w-9 h-9 text-lg shadow hover:shadow-lg flex items-center justify-center rounded-md bg-indigo-400 dark:bg-indigo-700 inline-block">
                  {{slotProps.data.icon}}
                </span>
                <span class="inline-block">
                  {{slotProps.data.name}}
                </span>
              </div>
            </template>
          </Column>
          <Column field="description" header="Desc" />
          <Column field="role" header="Role" />
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
      </div>
    </template>
  </Card>

  <Dialog v-model:visible="visibleFormDialog" modal :header="actionFormDialog === 'add' ? 'Tambah Kategori Jurnal' : 'Edit Kategori Jurnal'" :style="{ width: '25rem' }">
    <JournalCategoryForm :action="actionFormDialog" :item="selectedItem" @update="getData"/>
  </Dialog>

  <DashLoader :loading="loading" />

</template>

<script setup lang="ts">
import { Select } from '#components';

definePageMeta({
    title: 'Kategori Jurnal',
    description: 'Daftar Kategori Jurnal',
})
const client = useSanctumClient();
const route = useRoute();
const confirm = useConfirm();
const toast = useToast();

const filters = reactive({
  role: '',
})

const opsiRoles = ref([] as any)
const loadingRole = ref(false)
const getDataOptionRoles = async () => {
  loadingRole.value = true
  try {
    const res = await client('/api/option/roles') as any
    //tambah opsi role
    opsiRoles.value = [{
      label: 'Semua',
      value: '',
    },...res]
  } catch (error) {
    console.log(error);
  }
  loadingRole.value = false
}

const loading = ref(false);
const data = ref({} as any);
const getData = async () => {
    loading.value = true;
    try {
      const res = await client('/api/journal_category',{
        params: filters,
      }) as any
      data.value = res;
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
}
onMounted(() => {
    getData();
    getDataOptionRoles()
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
            await client(`/api/journal_category/${id}`,{
              method: 'DELETE',
            })
            toast.add({ severity: 'success', summary: 'Success', detail: 'Kategori jurnal berhasil dihapus', life: 3000 });
            getData()
          } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus kategori jurnal', life: 3000 });
          }
        }
    });
}
</script>