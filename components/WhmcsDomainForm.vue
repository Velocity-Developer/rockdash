<template>
  <form @submit.prevent="submit" class="space-y-3">
    <Message v-if="!props.id" severity="warn" :closable="false">
      ID domain belum dipilih.
    </Message>

    <Message v-if="loadError" severity="error" :closable="false">
      Gagal mengambil data domain.
    </Message>

    <div class="flex flex-col md:flex-row border-b pb-2 gap-2">
      <div class="md:basis-1/4">
        <label for="domain">Domain</label>
      </div>
      <div class="md:flex-1">
        <InputText id="domain" v-model="form.domain" class="w-full" :disabled="loadingData" />
      </div>
    </div>

    <div class="flex flex-col md:flex-row border-b pb-2 gap-2">
      <div class="md:basis-1/4">
        <label for="user_email">Email User</label>
      </div>
      <div class="md:flex-1">
        <InputText id="user_email" v-model="form.user_email" class="w-full" :disabled="loadingData" />
      </div>
    </div>

    <div class="flex flex-col md:flex-row border-b pb-2 gap-2">
      <div class="md:basis-1/4">
        <label for="status">Status</label>
      </div>
      <div class="md:flex-1">
        <InputText id="status" v-model="form.status" class="w-full" :disabled="true" />
      </div>
    </div>

    <div class="flex flex-col md:flex-row border-b pb-2 gap-2">
      <div class="md:basis-1/4">
        <label for="type">Type</label>
      </div>
      <div class="md:flex-1">
        <InputText id="type" v-model="form.type" class="w-full" :disabled="true" />
      </div>
    </div>

    <div class="flex flex-col md:flex-row border-b pb-2 gap-2">
      <div class="md:basis-1/4">
        <label for="registrar">Registrar</label>
      </div>
      <div class="md:flex-1">
        <InputText id="registrar" v-model="form.registrar" class="w-full" :disabled="true" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="space-y-1">
        <label for="registrationdate">Registration Date</label>
        <InputText
          id="registrationdate"
          v-model="form.registrationdate"
          type="date"
          class="w-full"
          :disabled="true"
        />
      </div>
      <div class="space-y-1">
        <label for="nextduedate">Next Due Date</label>
        <InputText
          id="nextduedate"
          v-model="form.nextduedate"
          type="date"
          class="w-full"
          :disabled="true"
        />
      </div>
      <div class="space-y-1">
        <label for="expirydate">Expiry Date</label>
        <InputText
          id="expirydate"
          v-model="form.expirydate"
          type="date"
          class="w-full"
          :disabled="true"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="space-y-1">
        <label for="whmcs_id">WHMCS ID</label>
        <InputNumber
          id="whmcs_id"
          v-model="form.whmcs_id"
          class="w-full"
          inputClass="w-full"
          :disabled="true"
        />
      </div>
      <div class="space-y-1">
        <label for="whmcs_userid">WHMCS User ID</label>
        <InputNumber
          id="whmcs_userid"
          v-model="form.whmcs_userid"
          class="w-full"
          inputClass="w-full"
          :disabled="true"
        />
      </div>
      <div class="space-y-1">
        <label for="id">Local ID</label>
        <InputNumber
          id="id"
          v-model="form.id"
          class="w-full"
          inputClass="w-full"
          :disabled="true"
        />
      </div>
    </div>

    <div class="flex justify-between items-center pt-2">
      <Button
        type="button"
        severity="secondary"
        text
        :disabled="loadingData || loadingSubmit || !props.id"
        @click="fetchData"
      >
        <Icon name="lucide:refresh-cw" :class="loadingData ? 'animate-spin' : ''" />
        Muat Ulang
      </Button>

      <Button type="submit" :loading="loadingSubmit" :disabled="loadingData || !props.id">
        <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin" />
        <Icon v-else name="lucide:save" />
        Simpan
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
const toast = useToast()
const client = useSanctumClient()

const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['submit', 'close'])

const createDefaultForm = () => ({
  id: 0,
  whmcs_id: null as number | null,
  whmcs_userid: null as number | null,
  domain: '',
  expirydate: '',
  registrationdate: '',
  nextduedate: '',
  type: '',
  status: '',
  registrar: '',
  user_email: '',
})

const form = reactive(createDefaultForm())

const loadingData = ref(false)
const loadingSubmit = ref(false)
const loadError = ref(false)

const fillForm = (data: any) => {
  form.id = data?.id || 0
  form.whmcs_id = data?.whmcs_id || null
  form.whmcs_userid = data?.whmcs_userid || null
  form.domain = data?.domain || ''
  form.expirydate = data?.expirydate || ''
  form.registrationdate = data?.registrationdate || ''
  form.nextduedate = data?.nextduedate || ''
  form.type = data?.type || ''
  form.status = data?.status || ''
  form.registrar = data?.registrar || ''
  form.user_email = data?.user_email || ''
}

const resetForm = () => {
  Object.assign(form, createDefaultForm())
}

const fetchData = async () => {
  if (!props.id) {
    resetForm()
    return
  }

  loadingData.value = true
  loadError.value = false

  try {
    const response = await client(`/api/whmcs-domain/${props.id}`)
    fillForm(response)
  } catch (error) {
    console.log(error)
    loadError.value = true
    toast.add({
      severity: 'error',
      summary: 'Error!',
      detail: 'Gagal mengambil data domain',
      life: 3000,
    })
  } finally {
    loadingData.value = false
  }
}

const submit = async () => {
  if (!props.id) return

  loadingSubmit.value = true

  try {
    await client(`/api/whmcs-domain/${props.id}`, {
      method: 'PUT',
      body: {
        domain: form.domain,
        user_email: form.user_email,
        expirydate: form.expirydate || null,
        registrationdate: form.registrationdate || null,
        nextduedate: form.nextduedate || null,
        type: form.type,
        status: form.status,
        registrar: form.registrar,
        whmcs_id: form.whmcs_id,
        whmcs_userid: form.whmcs_userid,
      },
    })

    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: 'Data domain berhasil diupdate',
      life: 3000,
    })

    emit('submit')
  } catch (error) {
    console.log(error)
    toast.add({
      severity: 'error',
      summary: 'Error!',
      detail: 'Gagal menyimpan data domain',
      life: 3000,
    })
  } finally {
    loadingSubmit.value = false
  }
}

onMounted(() => {
  fetchData()
})

watch(
  () => props.id,
  () => {
    fetchData()
  },
)
</script>
