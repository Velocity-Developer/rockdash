<template>
  <form @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-1">

      <div class="mb-3">
        <div class="block text-sm font-medium opacity-70">Judul</div>
        <InputText v-model="form.title" class="w-full"/>
        <Message v-if="errors.title" severity="error" size="small" class="mt-1" closable>{{ errors.title[0] }}</Message>
      </div>
      <div class="mb-3">
        <div class="block text-sm font-medium opacity-70">Deskripsi</div>
        <Textarea v-model="form.description" class="w-full" rows="3"></Textarea>
        <Message v-if="errors.description" severity="error" size="small" class="mt-1" closable>{{ errors.description[0] }}</Message>
      </div>
      <div class="mb-3">
        <div class="block text-sm font-medium opacity-70">Mulai</div>
        <DatePicker showTime hourFormat="24" v-model="form.start" class="w-full" />
        <Message v-if="errors.start" severity="error" size="small" class="mt-1" closable>{{ errors.start[0] }}</Message>
      </div>
      <div class="mb-3">
        <div class="block text-sm font-medium opacity-70">Selesai</div>
        <DatePicker showTime hourFormat="24" v-model="form.end" class="w-full" />
        <Message v-if="errors.end" severity="error" size="small" class="mt-1" closable>{{ errors.end[0] }}</Message>
      </div>
      <div class="mb-3">
        <div class="block text-sm font-medium opacity-70">Status</div>
        <Select 
          v-model="form.status" 
          :options="[{ label: 'Proses', value: 'ongoing' },{ label: 'Selesai', value: 'completed' },{ label: 'Batal', value: 'cancelled' }]" 
          optionLabel="label" optionValue="value" placeholder="Semua Status"
          class="w-full"
        />
        <Message v-if="errors.status" severity="error" size="small" class="mt-1" closable>{{ errors.status[0] }}</Message>
      </div>
      <div class="mb-3">
        <div class="block text-sm font-medium opacity-70">Kategori</div>
        <Select v-model="form.journal_category_id" :options="opsiCategories" optionLabel="name" optionValue="id" placeholder="Semua Kategori" class="w-full">
          <template #option="slotProps">
              <div class="flex items-center gap-2">
                <span v-if="slotProps.option.icon" class="w-9 h-9 text-lg shadow hover:shadow-lg flex items-center justify-center rounded-md bg-indigo-400 dark:bg-indigo-700 inline-block">
                  {{slotProps.option.icon}}
                </span>
                <div>{{ slotProps.option.name }}</div>
              </div>
          </template>
        </Select>
        <Message v-if="errors.journal_category_id" severity="error" size="small" class="mt-1" closable>{{ errors.journal_category_id[0] }}</Message>
      </div>
      <div class="mb-3">
        <div class="block text-sm font-medium opacity-70">Prioritas</div>
        <Select 
          v-model="form.priority" 
          :options="[{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }]" 
          optionLabel="label" optionValue="value" 
          placeholder="Semua Priority" 
          class="w-full"
        />
        <Message v-if="errors.priority" severity="error" size="small" class="mt-1" closable>{{ errors.priority[0] }}</Message>
      </div>

      <div class="flex flex-col gap-1 items-end">
        <Button :loading="loading" type="submit">
          <Icon name="lucide:loader-circle" v-if="loading" class="animate-spin" />
          <Icon name="lucide:save" v-else/>          
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
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const emit = defineEmits(['update']);
const client = useSanctumClient();
const toast = useToast();
const dateNow = new Date();
const useConfig = useConfigStore()

const opsiCategories = ref([] as any)
const getCategories = async () => {
  try {
    const res = await client('/api/journal_category',{
        params: {
          roles: useConfig.config?.role
        },
    }) as any
    opsiCategories.value = res.data
  } catch (error) {
    console.log(error);
  }
}

const form = reactive({
  title: '',
  description: '',
  start: dateNow,
  end: '',
  status: 'ongoing',
  priority: 'medium',
  user_id: '',
  webhost_id: '',
  cs_main_project_id: '',
  journal_category_id: '',
  id: ''
}) as any

onMounted(() => {  
  if(props.action === 'edit') {
    form.title = props.item.title
    form.description = props.item.description
    form.start = props.item.start
    form.end = props.item.end
    form.status = props.item.status
    form.priority = props.item.priority
    form.user_id = props.item.user_id
    form.webhost_id = props.item.webhost_id
    form.cs_main_project_id = props.item.cs_main_project_id
    form.journal_category_id = props.item.journal_category_id
    form.id = props.item.id
  }
  getCategories()
})

const errors = ref('' as any)
const loading = ref(false);
const handleSubmit = async () => {
  loading.value = true;
  errors.value = ''
  
  //ubah form.start dan form.end ke format yyyy-mm-dd h:m:s
  form.start = dayjs(form.start).format('YYYY-MM-DD HH:mm:ss')
  if(form.end) {
    form.end = dayjs(form.end).format('YYYY-MM-DD HH:mm:ss')
  } else {
    form.end = null
  }

  if(props.action === 'add') {
    try {
      await client('/api/journal', {
        method: 'POST',
        body: form
      })
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Jurnal berhasil ditambahkan',
        life: 3000
      });
      emit('update')
    } catch (error) {
      console.log(error);
      const er = useSanctumError(error)
      errors.value = er.bag as any
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Jurnal gagal ditambahkan',
        life: 3000
      });
    }
  } else {
    try {
      await client('/api/journal/' + form.id, {
        method: 'PUT',
        body: form
      })
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Jurnal berhasil diupdate',
        life: 3000
      });
      emit('update')
    } catch (error) {
      console.log(error);
      const er = useSanctumError(error)
      errors.value = er.bag as any
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Jurnal gagal diupdate',
        life: 3000
      });
    }
  }
  loading.value = false;
}
</script>