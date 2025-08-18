<template>
  <form @submit.prevent="handleSubmit">
    <div class="grid grid-cols-6 gap-2">

      <div class="col-span-6 bg-sky-50 dark:bg-sky-950 dark:border-sky-900 border border-sky-300 p-4 rounded-lg mb-3">
        <div class="font-medium flex items-center gap-1 text-sky-600 dark:text-sky-100 mb-3">
          <Icon name="lucide:user-circle" />
          User
        </div>
        <div class="grid grid-cols-2 gap-2">
            <div class="col-span-2 md:col-span-1">
              <div class="block text-sm font-medium opacity-70">User</div>
              <Select v-model="form.user_id" :options="opsiUsers" showClear filter optionValue="value" optionLabel="label" class="w-full" required>
                <template #option="slotProps">
                  <div class="flex items-center">
                      <img :alt="slotProps.option.label" :src="slotProps.option.avatar" class="w-8 h-8 rounded-full mr-2 object-cover" />
                      <div>{{ slotProps.option.label }}</div>
                  </div>
                </template>
              </Select>
              <Message v-if="errors.user_id" severity="error" size="small" class="mt-1" closable>{{ errors.user_id[0] }}</Message>
            </div>
            <div class="col-span-2 md:col-span-1">
              <div class="block text-sm font-medium opacity-70">Tim</div>
              <Select v-model="form.role" :options="opsiRoles" showClear filter optionValue="value" optionLabel="label" class="w-full" required />
              <Message v-if="errors.user_id" severity="error" size="small" class="mt-1" closable>{{ errors.user_id[0] }}</Message>
            </div>
        </div>
      </div>

      
      
      <div class="col-span-6">
        <div class="block text-sm font-medium opacity-70">Judul</div>
        <InputText v-model="form.title" class="w-full" required/>
        <Message v-if="errors.title" severity="error" size="small" class="mt-1" closable>{{ errors.title[0] }}</Message>
      </div>
      
      <div class="mb-3 col-span-6 md:col-span-3">
        <div class="block text-sm font-medium opacity-70">Webhost</div>
        <FormSelectWebhost v-model="form.webhost_id" />
        <Message v-if="errors.webhost_id" severity="error" size="small" class="mt-1" closable>{{ errors.webhost_id[0] }}</Message>
      </div>
      <div class="mb-3 col-span-6 md:col-span-3">
        <div class="block text-sm font-medium opacity-70">Project</div>
        <FormSelectCsMainProject 
          v-model="form.cs_main_project_id" 
          :webhost-id="form.webhost_id" 
        />
        <Message v-if="errors.cs_main_project_id" severity="error" size="small" class="mt-1" closable>{{ errors.cs_main_project_id[0] }}</Message>
      </div>

      <div class="col-span-6">
        <div class="block text-sm font-medium opacity-70">Deskripsi</div>
        <Textarea v-model="form.description" class="w-full" rows="6"></Textarea>
        <Message v-if="errors.description" severity="error" size="small" class="mt-1" closable>{{ errors.description[0] }}</Message>
      </div>
      <div class="col-span-3 md:col-span-3">
        <div class="block text-sm font-medium opacity-70">Mulai</div>
        <DatePicker showTime hourFormat="24" v-model="form.start" class="w-full" showIcon/>
        <Message v-if="errors.start" severity="error" size="small" class="mt-1" closable>{{ errors.start[0] }}</Message>
      </div>
      <div class="col-span-3 md:col-span-3">
        <div class="block text-sm font-medium opacity-70">Selesai</div>
        <DatePicker showTime hourFormat="24" v-model="form.end" class="w-full" showIcon/>
        <Message v-if="errors.end" severity="error" size="small" class="mt-1" closable>{{ errors.end[0] }}</Message>
      </div>
      <div class="col-span-6 md:col-span-2">
        <div class="block text-sm font-medium opacity-70">Status</div>
        <Select 
          v-model="form.status" 
          :options="[{ label: 'Proses', value: 'ongoing' },{ label: 'Selesai', value: 'completed' },{ label: 'Batal', value: 'cancelled' }]" 
          optionLabel="label" optionValue="value" placeholder="Semua Status"
          class="w-full"
        />
        <Message v-if="errors.status" severity="error" size="small" class="mt-1" closable>{{ errors.status[0] }}</Message>
      </div>

      <div class="col-span-6 md:col-span-2">
        <div class="block text-sm font-medium opacity-70">Kategori</div>
        <Select v-model="form.journal_category_id" :options="opsiCategories" optionLabel="name" optionValue="id" placeholder="Semua Kategori" class="w-full">
          <template #option="slotProps">
              <div class="flex items-center gap-2">
                <span v-if="slotProps.option.icon" class="w-9 h-9 text-lg shadow hover:shadow-lg flex items-center justify-center rounded-md bg-indigo-400 dark:bg-indigo-700">
                  {{slotProps.option.icon}}
                </span>
                <div>
                  {{ slotProps.option.name }}
                  <div class="text-xs opacity-50">{{ slotProps.option.role }}</div>
                </div>
              </div>
          </template>
        </Select>
        <Message v-if="errors.journal_category_id" severity="error" size="small" class="mt-1" closable>{{ errors.journal_category_id[0] }}</Message>
      </div>
      <div class="col-span-6 md:col-span-2">
        <div class="block text-sm font-medium opacity-70">Prioritas</div>
        <SelectButton 
          v-model="form.priority" 
          :options="[{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }]" 
          optionLabel="label" optionValue="value" 
          placeholder="Semua Priority" 
          class="w-full"
        />
        <Message v-if="errors.priority" severity="error" size="small" class="mt-1" closable>{{ errors.priority[0] }}</Message>
      </div>

      <!-- Journal Detail Support -->
       <div v-if="form.role == 'support' || form.detail_support" class="col-span-6 bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-900 border border-indigo-300 p-4 rounded-lg my-3">
        <div class="font-medium flex items-center gap-1 text-indigo-600 dark:text-indigo-100 mb-3">
          <span class="text-2xl">
            🤝
          </span>
          Info Support
        </div>
        <div class="grid grid-cols-2 gap-3">

          <div class="col-span-1">
            <div class="block text-sm font-medium opacity-70">No.HP</div>
            <InputText v-model="form.detail_support.hp" class="w-full"/>
            <Message v-if="errors.detail_support?.hp" severity="error" size="small" class="mt-1" closable>{{ errors.detail_support.hp[0] }}</Message>
          </div>
          <div class="col-span-1">
            <div class="block text-sm font-medium opacity-70">WhatsApp</div>
            <InputText v-model="form.detail_support.wa" class="w-full"/>
            <Message v-if="errors.detail_support?.wa" severity="error" size="small" class="mt-1" closable>{{ errors.detail_support.wa[0] }}</Message>
          </div>
          <div class="col-span-1">
            <div class="block text-sm font-medium opacity-70">Email</div>
            <InputText v-model="form.detail_support.email" type="email" class="w-full"/>
            <Message v-if="errors.detail_support?.email" severity="error" size="small" class="mt-1" closable>{{ errors.detail_support.email[0] }}</Message>
          </div>
          <div class="col-span-1">
            <div class="block text-sm font-medium opacity-70">Biaya</div>
            <InputNumber :minFractionDigits="0" v-model="form.detail_support.biaya" type="number" class="w-full"/>
            <Message v-if="errors.detail_support?.biaya" severity="error" size="small" class="mt-1" closable>{{ errors.detail_support.biaya[0] }}</Message>
          </div>
          <div class="col-span-1">
            <div class="block text-sm font-medium opacity-70">Tanggal Bayar</div>
            <DatePicker v-model="form.detail_support.tanggal_bayar" class="w-full" showTime hourFormat="24" showIcon/>
            <Message v-if="errors.detail_support?.tanggal_bayar" severity="error" size="small" class="mt-1" closable>{{ errors.detail_support.tanggal_bayar[0] }}</Message>
          </div>

        </div>
      </div>
      <!-- END Journal Detail Support -->

      <div class="col-span-6 mt-5">
        <div class="flex gap-1 justify-end items-end">
          <Button :loading="loading" type="button" severity="danger" @click="handleDelete">
            <Icon name="lucide:trash-2"/>  Hapus
          </Button>
          <Button :loading="loading" type="submit">
            <Icon name="lucide:loader-circle" v-if="loading" class="animate-spin" />
            <Icon name="lucide:save" v-else/>          
            {{ props.action === 'add' ? 'Tambah' : 'Update' }}
          </Button>
        </div>
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
const emit = defineEmits(['update','delete']);
const client = useSanctumClient();
const toast = useToast();
const confirm = useConfirm();
const dateNow = new Date();
const useConfig = useConfigStore()

const { data: opsiUsers } = await useAsyncData(
  'opsi-users', 
  () => client('/api/data_opsi/users'),
) as any
const { data: opsiRoles } = await useAsyncData(
  'opsi-roles', 
  () => client('/api/option/roles'),
) as any

const opsiCategories = ref([] as any)
const getCategories = async () => {
  try {
    const res = await client('/api/journal_category',{
        params: {
          role: form.role
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
  user_id: useConfig.config?.user?.id,
  webhost_id: null,
  cs_main_project_id: '',
  journal_category_id: '',
  id: '',
  role: useConfig.config?.role,
  detail_support: {
    hp: '',
    wa: '',
    email:'',
    bayar:'',
    tanggal_bayar:''
  }
}) as any

onMounted( async () => {  
  if(props.action === 'edit') {

    //get detail journal
    try {
      const res = await client('/api/journal/' + props.item.id) as any
      Object.assign(form, res)
    } catch (error) {
      console.log(error);
    }
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

  //if detail_support .tanggal_bayar is not empty, then format it to yyyy-mm-dd
  if(form.detail_support.tanggal_bayar) {
    form.detail_support.tanggal_bayar = dayjs(form.detail_support.tanggal_bayar).format('YYYY-MM-DD HH:mm:ss')
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

//confirm handleDelete
const handleDelete = async () => {
  confirm.require({
        message: 'Anda yakin hapus jurnal ini?',
        header: 'Hapus Jurnal',
        accept: async () => {
            try {              
              const re = await client(`/api/journal/${form.id}`, {
                  method: 'DELETE',
              })
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Jurnal berhasil dihapus',
                life: 3000
              });
              emit('delete')
            } catch (error) {
                const er = useSanctumError(error)                 
                toast.add({
                    severity: 'error',
                    summary: 'Gagal!',
                    detail: er.msg ? er.msg : 'Terjadi kesalahan saat menghapus jurnal',
                    life: 3000
                });
            }
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