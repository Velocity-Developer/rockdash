<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
    
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

          <InputText 
          v-else
          v-model="form[item.key]" 
          :id="item.key" 
          :type="item.type" 
          class="w-full" 
          :placeholder="item.label" 
          :required="item.required"/>

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
  options : '',
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
  { key: 'options', label: 'Options', type: 'textarea', required: false },
  { key: 'is_active', label: 'Active', type: 'switch', required: true },
  { key: 'username', label: 'Username', type: 'text', required: false },
  { key: 'password', label: 'Password', type: 'password', required: false },
] as any

const loadingSubmit = ref(false)
const errorSubmit = ref([] as any)
const handleSubmit = async () => {
  loadingSubmit.value = true
  errorSubmit.value = []

  //jika edit
  if(props.action == 'edit' && form.id) {
    try {
      const res = await client(`/api/servers/${form.id}`, {
        method: 'PUT',
        body: form
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
        body: form
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

</script>
