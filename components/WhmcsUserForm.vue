<template>
  <form @submit.prevent="submit" class="space-y-2">
    
    <div class="flex flex-col md:flex-row border-b pb-1 gap-2">
       <div class="md:basis-1/4 mb-1">
        <label for="firstname">First Name</label>
      </div>
      <div class="md:flex-1">
        <InputText v-model="form.firstname" class="w-full"/>
      </div>
    </div>
    <div class="flex flex-col md:flex-row border-b pb-1 gap-2">
      <div class="md:basis-1/4 mb-1">
        <label for="lastname">Last Name</label>
      </div>
      <div class="md:flex-1">
        <InputText v-model="form.lastname" class="w-full"/>
      </div>
    </div>
    <div class="flex flex-col md:flex-row border-b pb-1 gap-2">
      <div class="md:basis-1/4 mb-1">
        <label for="email">Email</label>
      </div>
      <div class="md:flex-1">
        <InputText v-model="form.email" class="w-full"/>
      </div>
    </div>
    <div class="flex flex-col md:flex-row border-b pb-1 gap-2">
      <div class="md:basis-1/4 mb-1">
        <label for="whmcs_id">WHMCS ID</label>
      </div>
      <div class="md:flex-1">
        <InputNumber v-model="form.whmcs_id" class="w-full" disabled/>
      </div>
    </div>
    <div class="flex justify-end">
      <Button type="submit" :loading="loading">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:save" />
        Simpan
      </Button>
    </div>

  </form>
</template>

<script setup lang="ts">
const toast = useToast()
const client = useSanctumClient();
const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
  action: {
    type: String,
    default: 'add',
  },
})

const form = reactive({
  firstname: '',
  lastname: '',
  email: '',
  whmcs_id: 0,
  id: 0,
})

const loading = ref(false);
const submit = async () => {
  loading.value = true;

  const endpoint = props.action === 'add' ? 'whmcs-user' : `whmcs-user/${props.id}`

  try {
    const response = await client(`api/${endpoint}`,{
      method: props.action === 'add' ? 'POST' : 'PUT',
      body: form,
    });      
    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: props.action === 'add' ? 'Data berhasil ditambahkan' : 'Data berhasil diupdate',
      life: 3000
    });
  } catch (error) {
    console.log(error);
    toast.add({
      severity: 'error',
      summary: 'Error!',
      detail: 'Gagal menyimpan data',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

const loadingData = ref(false);
onMounted( async () => {
  if (props.id) {
    loadingData.value = true;
    const res = await client(`api/whmcs-user/${props.id}`) as any
    form.firstname = res.firstname;
    form.lastname = res.lastname;
    form.email = res.email;
    form.whmcs_id = res.whmcs_id;
    form.id = res.id;
    loadingData.value = false;
  }
})
</script>
