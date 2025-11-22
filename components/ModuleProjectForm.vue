<template>
  <form @submit.prevent="submitHandle">
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
        :options="[{ label: 'Plugin', value: 'plugin' }, { label: 'Theme', value: 'theme' }, { label: 'Child Theme', value: 'child-theme' }]"
      />
    </div>
    <div class="flex justify-end">
      <Button type="submit" :loading="loadingSubmit">
        {{ props.action === 'add' ? 'Tambah' : 'Update' }}
      </Button>
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
const submitHandle = async () => {
  loadingSubmit.value = true
  try {
    if (props.action === 'add') {
      await client('/api/module-projects', {
        method: 'POST',
        params: form.value
      })
      emit('submit')
    } else if (props.action === 'edit') {
      await client(`/api/module-projects/${form.value.id}`, {
        method: 'PUT',
        params: form.value
      })
      emit('submit')
    }
  } catch (error) {
    console.log(error)
  } finally {
    loadingSubmit.value = false
  }
}
</script>

