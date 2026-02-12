<template>
  <form @submit.prevent="handleSubmit">
    <div class="grid grid-cols-6 gap-2">

      <div class="col-span-6 mb-6 rounded-md p-5 bg-sky-100 dark:bg-sky-950">
        <div class="font-bold flex items-center gap-1 mb-3">
          <Icon name="lucide:user-star" class="text-sky-600 dark:text-sky-100 text-xl"/>
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

      <div class="col-span-6 mb-6 rounded-md p-5 bg-indigo-100 dark:bg-indigo-950">
        <div class="font-bold flex items-center gap-1 mb-3">
          <Icon name="lucide:square-user" class=" text-indigo-600 dark:text-indigo-100 text-xl" />
          Info Klien
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div v-if="isDetailSupport || isDetailAdvertising" class="col-span-2 md:col-span-1">
            <div class="block text-sm font-medium opacity-70">No.HP</div>
            <InputText v-model="form.detail_support.hp" class="w-full"/>
            <Message v-if="errors.detail_support?.hp" severity="error" size="small" class="mt-1" closable>{{ errors.detail_support.hp[0] }}</Message>
          </div>
          <div v-if="isDetailSupport" class="col-span-2 md:col-span-1">
            <div class="block text-sm font-medium opacity-70">WhatsApp</div>
            <Select v-model="form.detail_support.wa" :options="[{ label: 'XL', value: 'XL' },{ label: 'Tsel', value: 'Tsel' }]" optionLabel="label" placeholder="Pilih WA/Tsel" optionValue="value" class="w-full"/>
            <Message v-if="errors.detail_support?.wa" severity="error" size="small" class="mt-1" closable>{{ errors.detail_support.wa[0] }}</Message>
          </div>
          <div v-if="isDetailSupport" class="col-span-2 md:col-span-1">
            <div class="block text-sm font-medium opacity-70">Email</div>
            <InputText v-model="form.detail_support.email" type="email" class="w-full"/>
            <Message v-if="errors.detail_support?.email" severity="error" size="small" class="mt-1" closable>{{ errors.detail_support.email[0] }}</Message>
          </div>

          <div class="mb-3 col-span-2 md:col-span-1">
            <div class="block text-sm font-medium opacity-70">Website</div>
            <FormSelectWebhost v-model="form.webhost_id" @update="handleWebhostUpdate" />
            <Message v-if="errors.webhost_id" severity="error" size="small" class="mt-1" closable>{{ errors.webhost_id[0] }}</Message>
          </div>
          <div v-if="isDetailSupport == false && isDetailAdvertising == false" class="mb-3 col-span-2 md:col-span-1">
            <div class="block text-sm font-medium opacity-70">Project</div>
            <FormSelectCsMainProject 
              v-model="form.cs_main_project_id" 
              :webhost-id="form.webhost_id" 
            />
            <Message v-if="errors.cs_main_project_id" severity="error" size="small" class="mt-1" closable>{{ errors.cs_main_project_id[0] }}</Message>
          </div>
        </div>
      </div>
            
      <div class="col-span-6 md:col-span-3">
        <div class="block text-sm font-medium opacity-70">Kategori</div>
        <Select v-model="form.journal_category_id" :options="opsiCategories" optionLabel="name" optionValue="id" placeholder="Semua Kategori" class="w-full">
          <template #value="slotProps">
            <div v-if="slotProps.value && kategoriSelectedInfo" class="flex items-center gap-2">
                <span v-if="kategoriSelectedInfo.icon" class="w-9 h-9 text-lg shadow hover:shadow-lg flex items-center justify-center rounded-md bg-indigo-400 dark:bg-indigo-700">
                  {{ kategoriSelectedInfo.icon }}
                </span>
                <div>
                  {{ kategoriSelectedInfo.name }}
                  <div class="text-xs opacity-50">{{ kategoriSelectedInfo.role }}</div>
                </div>
            </div>
          </template>
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
      
      <div class="col-span-6 md:col-span-3">
        <div class="block text-sm font-medium opacity-70">Status</div>
        <div class="flex items-center gap-2 justify-between">
          <SelectButton 
            v-model="form.status" 
            :options="opsiStatus" 
            optionLabel="label" optionValue="value" placeholder="Semua Status"
            class="w-full h-[55px]"
          />          
        </div>
        <Message v-if="errors.status" severity="error" size="small" class="mt-1" closable>{{ errors.status[0] }}</Message>
      </div>
            
      <div v-if="isDetailSupport == false && isDetailAdvertising == false" class="col-span-6 mt-6">
        <div class="block text-sm font-medium opacity-70">Judul</div>
        <InputText v-model="form.title" class="w-full" required/>
        <Message v-if="errors.title" severity="error" size="small" class="mt-1" closable>{{ errors.title[0] }}</Message>
      </div>

      <div class="col-span-3 md:col-span-3">
        <div class="block text-sm font-medium opacity-70">          
          <template v-if="kategoriSelectedInfo && ['Panduan','Konsultasi Update','Pengerjaan Update','Trouble'].includes(kategoriSelectedInfo.name)">
            Chat
          </template>
          <template v-else>Waktu</template> Mulai
        </div>
        <DatePicker showTime hourFormat="24" v-model="form.start" class="w-full" showIcon/>
        <Message v-if="errors.start" severity="error" size="small" class="mt-1" closable>{{ errors.start[0] }}</Message>
      </div>
      <div class="col-span-3 md:col-span-3">
        <div class="block text-sm font-medium opacity-70">
          <template v-if="kategoriSelectedInfo && ['Panduan','Konsultasi Update','Pengerjaan Update','Trouble'].includes(kategoriSelectedInfo.name)">
            Chat
          </template>
          <template v-else>Waktu</template> Selesai
        </div>
        <DatePicker showTime hourFormat="24" v-model="form.end" class="w-full" showIcon/>
        <Message v-if="errors.end" severity="error" size="small" class="mt-1" closable>{{ errors.end[0] }}</Message>
      </div>
      
      <div class="col-span-6 mt-4">
        <div class="block text-sm font-medium opacity-70">Deskripsi</div>

        <Editor v-model="form.description" class="w-full" editorStyle="height: 320px">
          <template v-slot:toolbar>
              <span class="ql-formats">
                  <button v-tooltip.bottom="'Bold'" class="ql-bold"></button>
                  <button v-tooltip.bottom="'Italic'" class="ql-italic"></button>
                  <button v-tooltip.bottom="'Underline'" class="ql-underline"></button>
              </span>
          </template>
        </Editor>

        <Message v-if="errors.description" severity="error" size="small" class="mt-1" closable>{{ errors.description[0] }}</Message>
      </div>
      
      <div v-if="isDetailSupport == false" class="col-span-6 md:col-span-2">
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

      <!-- Journal Detail Support Biaya -->
       <div v-if="isDetailSupport && kategoriSelectedInfo && ['Konsultasi Update','Trouble'].includes(kategoriSelectedInfo.name)" class="col-span-6 mb-6 rounded-md p-5 bg-emerald-50 dark:bg-emerald-950">
        <div class="font-bold flex items-center gap-1 mb-3">
          <Icon name="lucide:wallet" class=" text-emerald-600 dark:text-emerald-100 text-xl" />
          Biaya Support
        </div>
        <div class="grid grid-cols-2 gap-3">
          
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
            {{ getSubmitButtonText() }}
          </Button>
        </div>
      </div>

    </div>
  </form>

</template>

<script setup lang="ts">
const props = defineProps({
  defaultRole: {
    type: String,
    default: ''
  },
  action: {
    type: String,
    default: 'add'
  },
  item: {
    type: Object,
    default: () => {}
  }
})
import('quill')
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const emit = defineEmits(['update','delete']);
const client = useSanctumClient();
const toast = useToast();
const confirm = useConfirm();
const dateNow = new Date();
const useConfig = useConfigStore()
const namaWeb = ref('' as string)

const { data: opsiUsers } = await useAsyncData(
  'opsi-users-formjournal', 
  () => client('/api/data_opsi/users',{
    params: {
      role: props.action === 'add' && props.defaultRole ? props.defaultRole : ''
    },
  }),
  { default: () => [] }
) as any
const { data: opsiRoles } = await useAsyncData(
  'opsi-roles-formjournal', 
  () => client('/api/option/roles'),
  { default: () => [] }
) as any

const opsiStatus = computed(() => {
  const options = [
    { label: 'Proses', value: 'ongoing' },
    { label: 'Selesai', value: 'completed' },
  ]

  if (form.role === 'support') {
    options.push({ label: 'Follow Up', value: 'followup' })
  }

  options.push({ label: 'Batal', value: 'cancelled' })

  return options
})

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
  end: props.action === 'add' ? dateNow : '',
  status: 'ongoing',
  priority: 'medium',
  user_id: useConfig.config?.user?.id,
  webhost_id: null,
  cs_main_project_id: '',
  journal_category_id: '',
  id: '',
  role: props.action === 'add' ? (props.defaultRole || useConfig.config?.role) : '',
  detail_support: (props.defaultRole === 'support' || useConfig.config?.role === 'support' || props.defaultRole === 'advertising' || useConfig.config?.role === 'advertising') ? {
    hp: '',
    wa: '',
    email: '',
    biaya: '',
    tanggal_bayar: ''
  } : null
}) as any

const kategoriSelectedInfo = ref({} as any)
//watch form.journal_category_id
watch(() => form.journal_category_id, (newCategoryId) => {
  kategoriSelectedInfo.value = opsiCategories.value.find((category: any) => category.id === form.journal_category_id)

  //jika form.role = support, isi title dengan kategoriSelectedInfo.value.name + nama webhost
  if(form.role == 'support' && kategoriSelectedInfo.value) {
    form.title = 'Support '+kategoriSelectedInfo.value.name+' '+namaWeb.value
  }

  //jika form.role = advertising, isi title dengan kategoriSelectedInfo.value.name + nama webhost
  if(form.role == 'advertising' && kategoriSelectedInfo.value) {
    form.title = 'Ads '+kategoriSelectedInfo.value.name +' '+namaWeb.value
  }
  if(form.role == 'advertising' && kategoriSelectedInfo.value && !form.description) {
    form.description = 'Ads '+kategoriSelectedInfo.value.name +' untuk '+namaWeb.value
  }
})

// Watcher untuk user_id changes - update role berdasarkan user yang dipilih
watch(() => form.user_id, (newUserId) => {
  if (newUserId && opsiUsers.value && opsiUsers.value.length > 0) {
    const selectedUser = opsiUsers.value.find((user: any) => user.value === newUserId)
    if (selectedUser && selectedUser.role ) {
      form.role = selectedUser.role // Ambil role dari user
    }
  }
})

// Watcher untuk role changes
watch(() => form.role, (newRole) => {
  if (newRole === 'support') {
    // Pastikan detail_support diinisialisasi ketika role berubah menjadi support
    if (!form.detail_support) {
      form.detail_support = {
        hp: '',
        wa: '',
        email: '',
        biaya: '',
        tanggal_bayar: ''
      }
    }
  }
  // Update categories berdasarkan role baru
  getCategories()
})

const handleWebhostUpdate = (data: any) => {
  namaWeb.value = data.nama_web
}

onMounted( async () => {
  if(props.action === 'edit') {

    //get detail journal
    try {
      const res = await client('/api/journal/' + props.item.id) as any

      // Assign specific fields instead of using Object.assign
      form.id = res.id
      form.title = res.title || ''
      form.description = res.description || ''
      form.start = res.start ? new Date(res.start) : new Date()
      form.end = res.end ? new Date(res.end) : ''
      form.status = res.status || 'ongoing'
      form.priority = res.priority || 'medium'
      form.user_id = res.user_id
      form.webhost_id = res.webhost_id
      form.cs_main_project_id = res.cs_main_project_id
      form.journal_category_id = res.journal_category_id

      //jika res.role kosong,maka ambil role dari user
      if(!res.role) {
        form.role = res.user.user_roles?.[0] || ''
      } else {
        form.role = res.role
      }

      // Handle detail_support
      if (res.detail_support) {
        form.detail_support = {
          hp: res.detail_support.hp || '',
          wa: res.detail_support.wa || '',
          email: res.detail_support.email || '',
          biaya: res.detail_support.biaya || '',
          tanggal_bayar: res.detail_support.tanggal_bayar || ''
        }
      } else if (form.role === 'support') {
        form.detail_support = {
          hp: '',
          wa: '',
          email: '',
          biaya: '',
          tanggal_bayar: ''
        }
      }

      // Load categories first, then set kategoriSelectedInfo
      await getCategories()

      // Set kategoriSelectedInfo after categories are loaded
      if (form.journal_category_id) {
        kategoriSelectedInfo.value = opsiCategories.value.find((category: any) => category.id === form.journal_category_id)
      }

    } catch (error) {
      console.log(error);
    }
  } else if(props.action === 'clone') {
    // For clone mode, get full data from backend like edit mode
    try {
      const res = await client('/api/journal/' + props.item.id) as any

      // Clone data from API response
      form.journal_category_id = res.journal_category_id || ''
      form.description = res.description || ''
      form.webhost_id = res.webhost_id || null
      form.cs_main_project_id = res.cs_main_project_id || ''

      //jika res.role kosong,maka ambil role dari user
      if(!res.role) {
        form.role = res.user.user_roles?.[0] || ''
      } else {
        form.role = res.role
      }

      // Handle detail_support from API data
      if (res.detail_support) {
        form.detail_support = {
          hp: res.detail_support.hp || '',
          wa: res.detail_support.wa || '',
          email: res.detail_support.email || '',
          biaya: res.detail_support.biaya || '',
          tanggal_bayar: '' // Reset tanggal bayar untuk clone
        }
        console.log('Cloned detail_support from API:', form.detail_support)
      } else if (form.role === 'support') {
        form.detail_support = {
          hp: '',
          wa: '',
          email: '',
          biaya: '',
          tanggal_bayar: ''
        }
        console.log('Initialized new detail_support for role support')
      }

      // Set user yang login untuk clone
      form.user_id = useConfig.config?.user?.id

      // Set default values for new entry
      form.title = '' // Reset title
      form.start = dateNow
      form.end = dateNow // Set default end time untuk clone
      form.status = 'ongoing'
      form.priority = 'medium'
      form.id = '' // Reset ID untuk data baru

      // Load categories first, then set kategoriSelectedInfo
      await getCategories()

      // Set kategoriSelectedInfo after categories are loaded
      if (form.journal_category_id) {
        kategoriSelectedInfo.value = opsiCategories.value.find((category: any) => category.id === form.journal_category_id)

        // Generate title otomatis untuk support
        if(form.role == 'support' && kategoriSelectedInfo.value) {
          form.title = 'Support '+kategoriSelectedInfo.value.name
        }
      }

    } catch (error) {
      console.log('Error fetching journal data for clone:', error);
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Gagal mengambil data jurnal untuk di-clone',
        life: 3000
      });
    }
  } else {
    // For add mode, just load categories
    await getCategories()
  }
})
const errors = ref('' as any)
const loading = ref(false);
const handleSubmit = async () => {

  const validations = [
    {
      condition: !form.user_id,
      message: 'Wajib pilih User'
    },
    {
      condition: form.role === 'advertising' && !form.webhost_id,
      message: 'Wajib pilih website'
    },
    {
      condition: form.role === 'advertising' && !form.detail_support?.hp,
      message: 'Wajib isi no hp klien'
    }
  ]

  const error = validations.find(v => v.condition)

  if (error) {
    toast.add({
      severity: 'error',
      summary: 'Form belum lengkap !',
      detail: error.message,
      life: 3000
    })
    return
  }

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
  if(form.detail_support && form.detail_support.tanggal_bayar && form.detail_support.tanggal_bayar !== '') {
    form.detail_support.tanggal_bayar = dayjs(form.detail_support.tanggal_bayar).format('YYYY-MM-DD HH:mm:ss')
  } else if(form.detail_support && form.detail_support.tanggal_bayar === '') {
    form.detail_support.tanggal_bayar = null
  }

  if(props.action === 'add' || props.action === 'clone') {
    try {
      await client('/api/journal', {
        method: 'POST',
        body: form
      })
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: props.action === 'clone' ? 'Jurnal berhasil di-clone' : 'Jurnal berhasil ditambahkan',
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
        detail: props.action === 'clone' ? 'Jurnal gagal di-clone' : 'Jurnal gagal ditambahkan',
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

const isDetailSupport = computed(() => {
  //jika role = support maka true
  if(form.role === 'support') {
    return true
  }
  //jika role != support dan isi detail_support ada maka true
  // else if(form.role !== 'support' && form.detail_support !== null && form.detail_support.hp) {
  //   return true
  else {
    return false
  }
})

const isDetailAdvertising = computed(() => {
  //jika role = advertising maka true
  if(form.role === 'advertising') {
    return true
  }
  //jika role != advertising dan isi detail_support ada maka true
  // else if(form.role !== 'advertising' && form.detail_support !== null && form.detail_support.hp) {
  //   return true
  else {
    return false
  }
})

const getSubmitButtonText = () => {
  switch (props.action) {
    case 'add':
      return 'Tambah'
    case 'edit':
      return 'Update'
    case 'clone':
      return 'Clone'
    default:
      return 'Simpan'
  }
}

</script>