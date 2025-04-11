<template>
  <div>
    
    <div class="flex gap-2 justify-end items-center">      
      <Button size="small" severity="info">
        <Icon name="lucide:user-round-check" size="small"/> Permissions
      </Button>    
      <Button @click="openDialog(null,'add')" size="small">
        <Icon name="lucide:plus" size="small"/> Add Role
      </Button>
    </div>
    
    <DataTable :value="data" size="small" stripedRows scrollable>
      <Column field="name" header="Name Role"></Column>
      <Column field="guard_name" header="Guard Name"></Column>
      <Column field="user_count" header="Users"></Column>
      <Column field="permissions" header="Permissions">
        <template #body="slotProps">
          <span v-for="item in slotProps.data.permissions" :key="item">
            {{ item }},
          </span>
        </template>
      </Column>
      <Column field="options" header="">
        <template #body="slotProps">
          <div v-if="slotProps.data.name != 'admin'" class="flex gap-2 justify-end items-center">

            <Button @click="openDialog(slotProps.data,'edit')" severity="secondary" size="small">
              <Icon name="lucide:pen" size="small"/>
            </Button>
            <Button @click="confirmDelete(slotProps.data.name)" severity="danger" size="small">
              <Icon name="lucide:trash-2" size="small"/>
            </Button>

          </div>
        </template>
      </Column>
    </DataTable>

  </div>  
  
  <Dialog v-model:visible="dialog" :header="selectedItem ? 'Edit Role' : 'Add Role'" :style="{ width: '30rem', minHeight: '20vh' }" :breakpoints="{ '1000px': '30rem', '768px': '90vw' }" :modal="true">
      <form @submit.prevent="handleSubmit"> 
        <div class="mb-4">
          <label for="name" class="form-label">Name</label>
          <InputText v-model="form.name" id="name" type="text" class="w-full" required/>
          <Message size="small" severity="secondary" variant="simple">Nama role, huruf kecil tanpa spasi contoh: pegawai, admin_kasir</Message>
        </div>
        <div class="mb-4">
          <label for="permissions" class="form-label">Permissions</label>

          <div class="grid grid-flow-col grid-rows-3 md:grid-rows-2 gap-4 mt-2 mb-3">
            <div v-for="item in OptionPermissions" :key="item.value">
              <div class="flex items-center gap-1">
                <Checkbox :id="item.value" v-model="form.permissions" :value="item.value" />
                <label :for="item.value">{{ item.label }}</label>
              </div>
            </div>
          </div>
          <Message size="small" severity="secondary" variant="simple">Pilih minimal 1 permission</Message>
        </div>
        <div class="text-end mt-5">
          <Button type="submit">
            <div class="flex items-center gap-1 animate-pulse" v-if="isLoading"><Icon name="lucide:loader-circle" class="animate-spin"/> memproses..</div> 
            <div class="flex items-center gap-1" v-else><Icon name="lucide:save" /> Simpan</div>             
          </Button>
        </div>
      </form> 
  </Dialog>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Pengaturan Roles',
    description: 'Daftar Roles User di Aplikasi',
})
const client = useSanctumClient();
const { data, status, error, refresh } = await useAsyncData(
    'roles',
    () => client('/api/roles')
)

const { data: OptionPermissions } = await useAsyncData(
    'permissions',
    () => client('/api/option/permissions')
)

const form = reactive({
    name: '',
    permissions: []
})

const dialog = ref(false);
const dialogAction = ref('add');
const selectedItem = ref();
const isLoading = ref(false)
const toast = useToast();
const openDialog = (data: any, action: any) => {
    dialog.value = true;
    selectedItem.value = data;    
    dialogAction.value = action;

    if(action === 'edit') {
        form.name = data.name
        form.permissions = data.permissions
    } else {
        form.name = ''
        form.permissions = []
    }
}

const handleSubmit = async () => {
    isLoading.value = true;

    if(dialogAction.value === 'add') {        
          try {
            const response = await client(`/api/roles`, {
                method: 'POST',
                body: form
            })
            refresh(); 
            toast.add({
              severity: 'success',
              summary: 'Berhasil!',
              detail: 'Role berhasil disimpan',
              life: 3000
            });
            dialog.value = false;
        } catch (error: any) {
            const er = useSanctumError(error)
            toast.add({
                severity: 'error',
                summary: 'Gagal!',
                detail: error.response._data.message ? error.response._data.message : 'Terjadi kesalahan saat menambahkan data',
                life: 3000
            });
        }
    } else if(dialogAction.value === 'edit') {
        client(`/api/roles/${selectedItem.value.name}`, {
            method: 'PUT',
            body: form
        }).then(() => {
            refresh();
            dialog.value = false;
        });
    }

    isLoading.value = false
}

const confirm = useConfirm();
const confirmDelete = (name: any) => {
    confirm.require({
        message: 'Anda yakin hapus role ini?, semua user dengan role ini akan diubah menjadi user biasa',
        header: 'Peringatan Hapus Role',
        accept: () => {
            client(`/api/roles/${name}`, {
                method: 'DELETE',
            }).then(() => {
                refresh();
                toast.add({
                  severity: 'success',
                  summary: 'Berhasil!',
                  detail: 'Role berhasil dihapus',
                  life: 3000
                });
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
