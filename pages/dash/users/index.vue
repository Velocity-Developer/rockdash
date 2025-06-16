<template>

  <Card>
    <template #content>

      <div class="text-end mb-3">
        <Button type="button" @click="openDialog(null,'add')" size="small">
            <Icon name="lucide:plus" mode="svg"/> Tambah
        </Button>
      </div>

      <DataTable v-if="dataUs && dataUs.data" :value="dataUs.data" size="small" class="text-sm" stripedRows scrollable>
        <Column field="name" header="Name">
          <template #body="slotProps">

            <button type="button" @click="openDialog(slotProps.data,'edit')" class="flex justify-start items-center gap-2">
              <Avatar
              :image="slotProps.data.avatar_url"
              size="small"
              shape="circle"
              class="max-w-[40px]"/>
              <div>{{ slotProps.data.name }}</div>
            </button>

          </template> 
        </Column>
        <Column field="username" header="Username"></Column>
        <Column field="email" header="Email"></Column>
        <Column field="user_roles" header="Role">
          <template #body="slotProps">
            {{ slotProps.data.user_roles[0] }}
          </template> 
        </Column>
        <Column field="status" header="Status">
          <template #body="slotProps">
            <Badge v-if="slotProps.data.status == 'active'" severity="success">
              {{ slotProps.data.status }}
            </Badge>
            <Badge v-else severity="danger">
              {{ slotProps.data.status }}
            </Badge>
          </template>
        </Column>
        <Column field="options" header="">
          <template #body="slotProps">
            <Button type="button" @click="displayPop($event, slotProps.data)" variant="text" severity="secondary" rounded>
              <Icon name="lucide:ellipsis-vertical" mode="svg"/>
            </Button>
          </template>
        </Column>
      </DataTable>

      <div v-if="dataUs && dataUs.data" class="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <div class="text-sm">
          {{ dataUs.from }} - {{ dataUs.to }} of {{ dataUs.total }}
        </div>
        <Paginator            
            :rows="dataUs.per_page"
            :totalRecords="dataUs.total"
            @page="onPaginate"
            :pt="{
                root: (event: any) => {
                    const itemForPage =  dataUs.per_page;
                    const currentPage =  page - 1;
                    event.state.d_first = itemForPage * currentPage;
                },
            }"
          >
        </Paginator>
      </div>

    </template>    
  </Card>

  <Popover ref="op" :dismissable="true">
    <div v-if="selectedItem" class="rounded flex flex-col">
      <div class="text-xs border-b pb-1 mb-1 opacity-50">
        {{ selectedItem.name }}
      </div>
      <Button as="router-link" :to="'/dash/users/'+selectedItem.id" severity="secondary" variant="text" class="!p-1 !flex !justify-start">
        <Icon name="lucide:pen" mode="svg"/> Edit
      </Button>
      <Button type="button" @click="confirmDelete(selectedItem)" severity="danger" variant="text" class="!p-1 !flex !justify-start">
        <Icon name="lucide:trash" mode="svg"/> Delete
      </Button>
    </div>
  </Popover>

  <Dialog v-model:visible="dialog" :header="selectedItem ? 'Edit User' : 'Add User'" :style="{ width: '40rem', minHeight: '50vh' }" :breakpoints="{ '1000px': '40rem', '768px': '90vw' }" :modal="true">
    <DashUserPreview v-if="dialogAction == 'view'" :data="selectedItem" />
    <DashUserForm v-else :idUser="selectedItem?.id" :action="dialogAction" @update="getData"/>
  </Dialog>

  <DashLoader :loading="loading"/>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Users',
    description: 'Daftar User Aplikasi',
})
const route = useRoute();
const confirm = useConfirm();
const client = useSanctumClient();
const dialog = ref(false);
const dialogAction = ref('view');
const selectedItem = ref();
const op = ref();
const page = ref(route.query.page ? Number(route.query.page) : 1);

const dataUs = ref([] as any);
const loading = ref(false);
const getData = async () => {
  try {
    loading.value = true;
    const res = await client('/api/users?page='+page.value);
    dataUs.value = res
    loading.value = false;
  } catch (error) {
    const er = useSanctumError(error);
    loading.value = false;
  }
}

onMounted(() => {
  getData()
})

const onPaginate = (event: { page: number }) => {
    page.value = event.page + 1; 
    getData()
    navigateTo('/dash/users?page='+page.value)
};

const displayPop = async (event: Event, data: any) => {
  dialog.value = false;  
  op.value.hide();
  selectedItem.value = data;
  await op.value.show(event);
}

const openDialog = (data: any, action: any) => {
    op.value.hide();
    dialog.value = true;
    selectedItem.value = data&&data.id?data:'';    
    dialogAction.value = action;
}

const confirmDelete = (id: any) => {    
    confirm.require({
        message: 'Anda yakin hapus user ini?',
        header: 'Hapus User',
        accept: () => {
            client(`/api/users/${id.id}`, {
                method: 'DELETE',
            }).then(() => {
                getData();
            });
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

</script>

