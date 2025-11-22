<template>
  <form @submit.prevent="submitHandle">
    <div v-if="loadingFetch" class="flex justify-center items-center h-64">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
    </div>
    <div v-else>
      <div class="mb-4">
        <label for="name" class="block text-sm opacity-50">Nama</label>
        <InputText v-model="form.name" class="w-full" />
      </div>
      <div class="mb-4">
        <label for="version" class="block text-sm opacity-50">Versi</label>
        <InputText v-model="form.version" class="w-full" />
      </div>
      <div class="mb-4">
        <label for="github_url" class="block text-sm opacity-50">URL GitHub</label>
        <InputText v-model="form.github_url" class="w-full" />
      </div>
      <div class="mb-4">
        <label for="download_url" class="block text-sm opacity-50">URL Download</label>
        <InputText v-model="form.download_url" class="w-full" />
      </div>
      <div class="mb-4">
        <label for="type" class="block text-sm opacity-50">Tipe</label>
        <Select 
          v-model="form.type" 
          class="w-full" 
          optionLabel="label"
          optionValue="value"
          :options="[{ label: 'Plugin', value: 'plugin' }, { label: 'Theme', value: 'theme' }, { label: 'Child Theme', value: 'child_theme' }]"
        />
      </div>
      <div class="flex justify-end">
        <Button type="submit" :loading="loadingSubmit">
          <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin"/>
          <Icon v-else name="lucide:save" />
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
    required: true
  },
  data: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['submit'])
const client = useSanctumClient()
const toast = useToast()

const form = ref({
  name: '',
  version: '',
  github_url: '',
  download_url: '',
  type: 'plugin',
  id: ''
}) as any

const loadingSubmit = ref(false)
const loadingFetch = ref(false)

const fetchModuleProject = async (id: string) => {
  loadingFetch.value = true
  try {
    const response = await client(`/api/module-projects/${id}`, {
      method: 'GET'
    }) as any
    form.value = {
      name: response.name || '',
      version: response.version || '',
      github_url: response.github_url || '',
      download_url: response.download_url || '',
      type: response.type || 'plugin',
      id: response.id || id
    }
  } catch (error) {
    console.log(error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal mengambil data module project',
      life: 3000
    })
  } finally {
    loadingFetch.value = false
  }
}

const submitHandle = async () => {
  loadingSubmit.value = true
  try {
    if (props.action === 'add') {
      await client('/api/module-projects', {
        method: 'POST',
        params: form.value
      })
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Data module project berhasil ditambahkan',
        life: 3000
      })
      emit('submit')

      //reset form
      form.value = {
        name: '',
        version: '',
        github_url: '',
        download_url: '',
        type: 'plugin',
        id: ''
      }
    } else if (props.action === 'edit') {
      await client(`/api/module-projects/${form.value.id}`, {
        method: 'PUT',
        params: form.value
      })
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Data module project berhasil diupdate',
        life: 3000
      })
      emit('submit')
    }
  } catch (error) {
    console.log(error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: props.action === 'add' ? 'Gagal menambah data module project' : 'Gagal mengupdate data module project',
      life: 3000
    })
  } finally {
    loadingSubmit.value = false
  }
}

watch(() => props.action, (newAction) => {
  if (newAction === 'add') {
    form.value = {
      name: '',
      version: '',
      github_url: '',
      download_url: '',
      type: 'plugin',
      id: ''
    }
  }
})

watch(() => props.data, (newData) => {
  if (props.action === 'edit' && newData && newData.id) {
    fetchModuleProject(newData.id)
  }
}, { immediate: true })
</script>

