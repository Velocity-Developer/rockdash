<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-4" autocomplete="off">
    <div v-for="item in fields" :key="item.key" class="flex flex-col md:flex-row border-b dark:border-zinc-800 py-1">
        <div class="md:basis-1/4 mb-1">
          <label :for="item.key">{{ item.label }}</label>
        </div>
        <div class="md:flex-1">

          <ToggleSwitch
          v-if="item.type == 'switch'"
          v-model="form[item.key]"
          :required="item.required"
          />

          <Select
          v-else-if="item.type == 'option'"
          v-model="form[item.key]"
          :options="item.options"
          optionLabel="label" optionValue="value"
          class="w-full"
          :required="item.required"
          />

          <Textarea
          v-else-if="item.type == 'textarea'"
          v-model="form[item.key]"
          class="w-full"
          :required="item.required"
          />

          <div v-else-if="item.key === 'password'" class="flex flex-col gap-3">
            <!-- Toggle selalu muncul, baik untuk edit maupun create -->
            <div class="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              <ToggleSwitch 
                v-model="editPassword" 
                inputId="edit-password" />
              <label for="edit-password" class="text-sm cursor-pointer font-medium">
                {{ props.action === 'edit' ? 'Ubah Password' : 'Set Password' }}
              </label>
              <small v-if="props.action === 'edit'" class="text-gray-500 ml-2">
                (Aktifkan untuk mengubah password)
              </small>
            </div>
            
            <transition name="slide-down">
              <InputText 
                v-if="editPassword"
                v-model="form[item.key]" 
                :id="`pwd-${randomId}`" 
                :name="`pwd-${randomId}`"
                type="password" 
                class="w-full" 
                :placeholder="editPassword ? 'Masukkan password baru' : item.label" 
                :required="item.required && editPassword"
                autocomplete="new-password"
                :data-lpignore="true"
                :data-1p-ignore="true"
                :data-bwignore="true"/>
            </transition>
          </div>

          <InputText 
          v-else-if="item.type !== 'password'"
          v-model="form[item.key]" 
          :id="item.key" 
          :name="item.key"
          :type="item.type" 
          class="w-full" 
          :placeholder="item.label" 
          :required="item.required"
          autocomplete="new-password"/>

        </div>
    </div>

    <div v-if="errorSubmit">
      <Message v-for="item in errorSubmit" severity="error" text="true">
        {{ item[0] }}
      </Message>
    </div>

    <div class="text-end">
      <Button type="submit" :loading="loadingSubmit">
        <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:save" />
        Simpan
      </Button>
    </div>
  </form>

</template>

<script setup lang="ts">
import { Textarea } from '#components'

const props = defineProps({
  data : {
    type: Object,
    required: false
  },
  action : {
    type: String,
    required: false
  }
})
const emit = defineEmits(['update'])
const client = useSanctumClient()
const toast = useToast()

const form = reactive({
  name : 'Server',
  type : 'directadmin',
  ip_address : '0.0.0.0',
  hostname : '',
  port : '21',
  is_active : false,
  username : '',
  password : '',
  id: props.data ? props.data.id : null
}) as any

const fields = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'type', label: 'Type', type: 'option', options: [{ label: 'DirectAdmin', value: 'directadmin' }, { label: 'Cpanel', value: 'cpanel' },{ label: 'Plesk', value: 'plesk' },{ label: 'Other', value: 'other' }], required: true },
  { key: 'ip_address', label: 'IP Address', type: 'text', required: false },
  { key: 'hostname', label: 'Hostname', type: 'text', required: false },
  { key: 'port', label: 'Port', type: 'text', required: true },
  { key: 'is_active', label: 'Active', type: 'switch', required: true },
  { key: 'username', label: 'Username', type: 'text', required: false },
  { key: 'password', label: 'Password', type: 'password', required: false, autocomplete: 'new-password' },
] as any

const loadingSubmit = ref(false)
const errorSubmit = ref([] as any)
const randomId = ref(Math.random().toString(36).substring(7))
// For edit mode: toggle should be OFF (false) by default
// For create mode: toggle should be ON (true) by default
const editPassword = ref(props.action !== 'edit')

const handleSubmit = async () => {
  loadingSubmit.value = true
  errorSubmit.value = []

  // Prepare form data - only include password if editing password
  const submitData = { ...form }
  if (!editPassword.value) {
    delete submitData.password
  }

  //jika edit
  if(props.action == 'edit' && form.id) {
    try {
      const res = await client(`/api/servers/${form.id}`, {
        method: 'PUT',
        body: submitData
      })
      toast.add({      
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Server Berhasil Disimpan',
        life: 3000
      })
      emit('update')
    } catch (error) {
      const er = useSanctumError(error);
      errorSubmit.value = er.bag;
      toast.add({      
        severity: 'error',
        summary: 'Gagal!',
        detail: er.msg ? er.msg : 'Terjadi kesalahan saat menyimpan data',
        life: 3000
      })
    }
  } else {
    //tambah data baru
    try {
      const res = await client('/api/servers', {
        method: 'POST',
        body: submitData
      })
      toast.add({      
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Server Berhasil Disimpan',
        life: 3000
      })
      emit('update')
    } catch (error) {
      const er = useSanctumError(error);
      errorSubmit.value = er.bag;
      toast.add({      
        severity: 'error',
        summary: 'Gagal!',
        detail: er.msg ? er.msg : 'Terjadi kesalahan saat menyimpan data',
        life: 3000
      })
    }
  }
  
  loadingSubmit.value = false
}

onMounted(() => {
  if(props.data) {
    Object.assign(form, props.data)
  }
})

watch(() => props.data, (val) => {
 if(val) {
   Object.assign(form, val)
 }
})

// Reset password field when toggle is turned off
watch(editPassword, (newVal) => {
  if (!newVal) {
    form.password = ''
  }
})

</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
