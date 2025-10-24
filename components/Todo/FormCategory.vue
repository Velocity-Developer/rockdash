<template>
  <form @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-1">
        <label for="name">Nama</label>
        <InputText v-model="form.name"/>
      </div>
      <div class="flex flex-col gap-1">
        <label for="color">Warna</label>
        <div class="flex gap-2 items-center">
          <InputText
            v-model="form.color"
            placeholder="#ffffff atau nama warna"
          />
          <div
            class="w-8 h-8 rounded border border-gray-300"
            :style="{ backgroundColor: form.color || '#ffffff' }"
          ></div>
        </div>
        <span class="text-sm text-gray-500">Gunakan hex color (#ffffff) atau nama warna (red, blue)</span>
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

const form = reactive({
  name: '',
  description: '',
  color: '#ffffff',
  icon: '🎈',
})

onMounted(() => {
  if(props.action === 'edit') {
    form.name = props.item.name
    form.description = props.item.description
    form.color = props.item.color
    form.icon = props.item.icon
  }
})

const loading = ref(false)
const handleSubmit = async () => {
  loading.value = true
  if(props.action === 'add') {
    try {
      await client('/api/todo_category', {
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
      await client('/api/todo_category/' + props.item.id, {
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