<template>

  <SelectButton 
    v-if="action !== 'add'"
    v-model="action"
    :options="optionAction"
    optionLabel="label"
    optionValue="value"
    class="mb-3"
    />

  <form @submit.prevent="handleSubmit">

    <div v-for="item in fields" :key="item.key">

      <div v-if="item.action && item.action.includes(action)" class="flex flex-col md:flex-row border-b py-1">
        <div class="md:basis-1/4 mb-1">
          <label :for="item.key">{{ item.label }}</label>
        </div>
        <div v-if="!loading" class="md:flex-1">
          
          <div v-if="item.type=='select'  && item.key !== 'role'">
            <Select :id="item.key" v-model="form[item.key]" :options="item.options" optionLabel="label" optionValue="value" class="w-full" :required="item.required"/>
          </div>

          <div v-else-if="item.type=='select' && item.key == 'role'">
            <Select :id="item.key" v-model="form[item.key]" :options="OptionRoles" optionLabel="label" optionValue="value" class="w-full" :required="item.required"/>
          </div>

          <div v-else-if="item.type=='switch'">
            <SelectButton :id="item.key" v-model="form[item.key]" :options="item.options" optionLabel="label" optionValue="value" class="w-full" :required="item.required"/>
          </div>

          <DatePicker v-else-if="item.type=='date'" :id="item.key" v-model="form[item.key]" class="w-full" :required="item.required"/>

          <Textarea v-else-if="item.type=='textarea'" :type="item.type" v-model="form[item.key]" class="w-full" :required="item.required"/>
          
          <InputText v-else :type="item.type" v-model="form[item.key]" class="w-full" :required="item.required"/>

          <div v-if="errors[item.key]">        
            <Message severity="warn" class="my-1" closable>
              {{ errors[item.key][0] }}
            </Message>
          </div>

        </div>
        <div v-else class="md:flex-1">
          <Skeleton class="w-full !h-[2rem]" />
        </div>
      </div>

    </div>
    
    <div class="text-end mt-3">
      <Button type="submit">
        <span v-if="isLoading" class="flex items-center gap-1">
          <Icon name="lucide:loader-circle" mode="svg" class="mr-1 animate-spin" /> proses..
        </span>
        <span v-else class="flex items-center gap-1">
          <Icon name="lucide:save" mode="svg" class="mr-1" /> Simpan
        </span>
      </Button>
    </div>

  </form>

</template>

<script setup lang="ts">
  import { useDayjs } from '#dayjs'
  const dayjs = useDayjs()
  const emit = defineEmits(['update'])
  const props = defineProps(['idUser','action'])
  const idUser = props.idUser
  const action = ref(props.action)
  const client = useSanctumClient();
  const isLoading = ref(false)
  const toast = useToast();
  const errors = ref('' as any)

  const optionAction = [
    { label: 'Profil', value: 'edit' },
    { label: 'Password', value: 'edit_password' },
    { label: 'Avatar', value: 'edit_avatar' },
  ];

  
  // const { data: OptionRoles} = await useAsyncData(
  //   'options-role',
  //   () => client('/api/option/roles')
  // )
  // const roleField = fields.find(f => f.key == 'role');
  // if (roleField) {
  //   roleField.options = OptionRoles.value;
  // }
  const OptionRoles = ref([
    { label: 'Admin', value: 'admin' },
  ] as any)
  const getDataOptionRoles = async () => {    
    try {
      const res = await client('/api/option/roles');
      OptionRoles.value = res
    } catch (error) {
      console.log(error);
    }
  }

  const fields = [
    { 
      key: 'name', 
      label: 'Name', 
      type: 'text',
      required: true,
      action: ['add','edit'],
    },
    { 
      key: 'username',
      label: 'UserName',
      type: 'text',
      required: true,
      action: ['add','edit'],
    },
    { 
      key: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      action: ['add','edit'],
    },
    { 
      key: 'hp',
      label: 'HP',
      type: 'text',
      required: false,
      action: ['add','edit'],
    },
    { 
      key: 'alamat', 
      label: 'Alamat', 
      type: 'textarea',
      required: false,
      action: ['add','edit']
   },
    { 
      key: 'tgl_masuk', 
      label: 'Tanggal Masuk', 
      type: 'date',
      required: false,
      action: ['add','edit']
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'switch', 
      options: [{ label: 'Active', value: 'active' }, { label: 'Deactive', value: 'deactive' }],
      required: true,
      action: ['add','edit']
    },
    { 
      key: 'role', 
      label: 'Role', 
      type: 'select', 
      options: OptionRoles.value,
      required: true,
      action: ['add','edit'],
    },
    { 
      key: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      action: ['add','edit_password'],
    },
    { 
      key: 'password_confirmation',
      label: 'Confirm Password',
      type: 'password',
      required: true,
      action: ['add','edit_password'],
    },
  ];

  const form = reactive({
    name: '',
    username: '',
    email: '',
    alamat: '',
    hp: '',
    tgl_masuk: '',
    status: 'active',
    password: '',
    password_confirmation: '',
    role: '',
    avatar: '',
  } as any)

//update form dari data
const loading = ref(false);
const getData = async () => {
  if (idUser) {
    loading.value = true;
    try {
      const res = await client('/api/users/'+idUser);
      form.name = res.name
      form.username = res.username
      form.email = res.email
      form.hp = res.hp
      form.alamat = res.alamat
      form.tgl_masuk = res.tgl_masuk
      form.status = res.status
      form.role = res.user_roles?res.user_roles[0]:''
      form.avatar = res.avatar
      form.password = null,
      form.password_confirmation = null
    } catch (error) {
      const er = useSanctumError(error);
      loading.value = false;
    }
    loading.value = false;
  }
}

onMounted(() => {
  getData()
  getDataOptionRoles()
})

//watch action
watch(() => action.value, (newVal, oldVal) => {
  getData()
})

  const handleSubmit = async () => {
    isLoading.value = true
    errors.value = ''

    if(form.tgl_masuk){
      form.tgl_masuk = dayjs(form.tgl_masuk).format('YYYY-MM-DD')
    }

    if(action.value == 'add'){
      try {          
        const response = await client(`/api/users`, {
          method: 'POST',
          body: form
        })
        toast.add({
          severity: 'success',
          summary: 'Berhasil!',
          detail: 'Data User berhasil ditambah',
          life: 3000
        });
        emit('update')
      } catch (error) {
        const er = useSanctumError(error)  
        errors.value = er.bag
        console.log(errors) 
        toast.add({
            severity: 'error',
            summary: 'Gagal!',
            detail: er.msg ? er.msg : 'Terjadi kesalahan saat menambahkan data',
            life: 3000
        });
      }
    } else if(action.value == 'edit' || action.value == 'edit_password') {
      try {          
        const response = await client(`/api/users/`+idUser, {
          method: 'PUT',
          body: form
        })
        toast.add({
          severity: 'success',
          summary: 'Berhasil!',
          detail: 'Data User berhasil disimpan',
          life: 3000
        });
        emit('update')
      } catch (error) {
        const er = useSanctumError(error)  
        errors.value = er.bag
        console.log(errors) 
        toast.add({
            severity: 'error',
            summary: 'Gagal!',
            detail: er.msg ? er.msg : 'Terjadi kesalahan saat simpan data',
            life: 3000
        });
      }
    }
    
    isLoading.value = false
  }

</script>
