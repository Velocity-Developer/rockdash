<template>
  <form @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-1">
        <label for="name">Nama</label>
        <InputText v-model="form.name"/>
      </div>
      <div class="flex flex-col gap-1">
        <label for="role">Role</label>
        <Select
          v-model="form.role"
          :options="opsiRoles"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih role"
          :disabled="loadingRole"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label for="icon">Icon (Emoji)</label>
        <InputText v-model="form.icon"/>
        <span class="text-sm text-gray-500">Gunakan emoji, contoh: 🎈</span>
      </div>
      <div class="flex flex-col gap-1">
        <label for="description">Deskripsi</label>
        <TextArea v-model="form.description" rows="3"></TextArea>
      </div>
      <div class="flex flex-col gap-1 items-end">
        <Button :loading="loading" type="submit">
          <Icon name="lucide:save" />
          {{ props.action === 'add' ? 'Tambah' : 'Update' }}
        </Button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = defineProps({
  action: {
    type: String,
    default: 'add'
  },
  item: {
    type: Object,
    default: () => {}
  }
})
const emit = defineEmits(['update']);
const client = useSanctumClient();
const toast = useToast();

const opsiRoles = ref([] as any)
const loadingRole = ref(false)
const getDataOptionRoles = async () => {
  loadingRole.value = true
  try {
    const res = await client('/api/option/roles') as any
    opsiRoles.value = res
  } catch (error) {
    console.log(error);
  }
  loadingRole.value = false
}

const form = reactive({
  name: '',
  description: '',
  role: '',
  icon: '🎈',
})

onMounted(() => {
  getDataOptionRoles()
  if(props.action === 'edit') {
    form.name = props.item.name
    form.description = props.item.description
    form.role = props.item.role
    form.icon = props.item.icon
  }
})

const loading = ref(false)
const handleSubmit = async () => {
  loading.value = true
  if(props.action === 'add') {
    try {
      await client('/api/todo_categories', {
        method: 'POST',
        body: form
      })
      emit('update')
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Kategori todo berhasil ditambahkan',
        life: 3000
      });
    } catch (error) {
      console.log(error);
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Kategori todo gagal ditambahkan',
        life: 3000
      });
    }
  } else {
    try {
      await client('/api/todo_categories/' + props.item.id, {
        method: 'PUT',
        body: form
      })
      emit('update')
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Kategori todo berhasil diupdate',
        life: 3000
      });
    } catch (error) {
      console.log(error);
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Kategori todo gagal diupdate',
        life: 3000
      });
    }
  }
  loading.value = false
}


</script>