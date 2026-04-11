<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <Message v-if="loadError" severity="error" :closable="false">
      Gagal memuat data subscription.
    </Message>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="md:col-span-2">
        <label class="mb-1 block text-sm font-medium">Webhost</label>
        <FormSelectWebhost v-model="form.webhost_id" :disabled="props.action === 'add' && !!props.webhost_id" />
        <small v-if="errors.webhost_id" class="text-red-500">{{ errors.webhost_id[0] }}</small>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium">CS Main Project</label>
        <FormSelectCsMainProject v-model="form.cs_main_project_id" :webhost-id="form.webhost_id" />
        <small v-if="errors.cs_main_project_id" class="text-red-500">{{ errors.cs_main_project_id[0] }}</small>
      </div>

      <div>
        <label for="parent_subscription_id" class="mb-1 block text-sm font-medium">Parent Subscription ID</label>
        <InputNumber
          id="parent_subscription_id"
          v-model="form.parent_subscription_id"
          class="w-full"
          inputClass="w-full"
          :useGrouping="false"
        />
        <small v-if="errors.parent_subscription_id" class="text-red-500">{{ errors.parent_subscription_id[0] }}</small>
      </div>

      <div>
        <label for="source_type" class="mb-1 block text-sm font-medium">Source Type</label>
        <Select
          id="source_type"
          v-model="form.source_type"
          :options="sourceTypes"
          class="w-full"
        />
      </div>

      <div>
        <label for="service_type" class="mb-1 block text-sm font-medium">Service Type</label>
        <Select
          id="service_type"
          v-model="form.service_type"
          :options="serviceTypes"
          class="w-full"
        />
      </div>

      <div>
        <label for="status" class="mb-1 block text-sm font-medium">Status</label>
        <Select
          id="status"
          v-model="form.status"
          :options="statusOptions"
          class="w-full"
        />
      </div>

      <div>
        <label for="payment_status" class="mb-1 block text-sm font-medium">Payment Status</label>
        <Select
          id="payment_status"
          v-model="form.payment_status"
          :options="paymentStatusOptions"
          class="w-full"
        />
      </div>

      <div>
        <label for="start_date" class="mb-1 block text-sm font-medium">Start Date</label>
        <DatePicker v-model="form.start_date" dateFormat="dd-mm-yy" class="w-full" inputClass="w-full" />
        <small v-if="errors.start_date" class="text-red-500">{{ errors.start_date[0] }}</small>
      </div>

      <div>
        <label for="end_date" class="mb-1 block text-sm font-medium">End Date</label>
        <DatePicker v-model="form.end_date" dateFormat="dd-mm-yy" class="w-full" inputClass="w-full" />
        <small v-if="errors.end_date" class="text-red-500">{{ errors.end_date[0] }}</small>
      </div>

      <div>
        <label for="renewed_from_date" class="mb-1 block text-sm font-medium">Renewed From Date</label>
        <DatePicker v-model="form.renewed_from_date" dateFormat="dd-mm-yy" class="w-full" inputClass="w-full" />
        <small v-if="errors.renewed_from_date" class="text-red-500">{{ errors.renewed_from_date[0] }}</small>
      </div>

      <div>
        <label for="paid_at" class="mb-1 block text-sm font-medium">Paid At</label>
        <DatePicker v-model="form.paid_at" dateFormat="dd-mm-yy" class="w-full" inputClass="w-full" />
        <small v-if="errors.paid_at" class="text-red-500">{{ errors.paid_at[0] }}</small>
      </div>

      <div>
        <label for="nominal" class="mb-1 block text-sm font-medium">Nominal</label>
        <InputNumber
          id="nominal"
          v-model="form.nominal"
          class="w-full"
          inputClass="w-full"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          :min="0"
        />
        <small v-if="errors.nominal" class="text-red-500">{{ errors.nominal[0] }}</small>
      </div>

      <div class="md:col-span-2">
        <label for="description" class="mb-1 block text-sm font-medium">Deskripsi</label>
        <Textarea id="description" v-model="form.description" rows="4" class="w-full" autoResize />
        <small v-if="errors.description" class="text-red-500">{{ errors.description[0] }}</small>
      </div>
    </div>

    <div class="flex items-center justify-end gap-2 border-t pt-4">
      <Button
        v-if="props.action === 'edit'"
        type="button"
        severity="secondary"
        text
        :disabled="loadingData || loadingSubmit"
        @click="fetchData"
      >
        <Icon name="lucide:refresh-cw" :class="loadingData ? 'animate-spin' : ''" />
        Muat Ulang
      </Button>

      <Button type="submit" :loading="loadingSubmit" :disabled="loadingData">
        <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin" />
        <Icon v-else name="lucide:save" />
        {{ props.action === 'edit' ? 'Update' : 'Simpan' }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'

type FormErrors = Record<string, string[]>

const dayjs = useDayjs()
const toast = useToast()
const client = useSanctumClient()

const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
  webhost_id: {
    type: Number,
    default: 0,
  },
  action: {
    type: String,
    default: 'add',
  },
})

const emit = defineEmits(['submit'])

const sourceTypes = ['csmainproject', 'whmcs_domain', 'whmcs_hosting', 'manual']
const serviceTypes = ['domain', 'hosting', 'website', 'bundle']
const statusOptions = ['active', 'expired', 'cancelled', 'pending']
const paymentStatusOptions = ['paid', 'partial', 'unpaid']

const createDefaultForm = () => ({
  webhost_id: null as number | null,
  cs_main_project_id: null as number | null,
  parent_subscription_id: null as number | null,
  source_type: 'csmainproject',
  service_type: 'hosting',
  start_date: null as Date | null,
  end_date: null as Date | null,
  renewed_from_date: null as Date | null,
  status: 'active',
  payment_status: 'unpaid',
  paid_at: null as Date | null,
  nominal: 0 as number | null,
  description: '',
})

const form = reactive(createDefaultForm())
const errors = ref<FormErrors>({})
const loadingData = ref(false)
const loadingSubmit = ref(false)
const loadError = ref(false)

const toDate = (value?: string | null) => {
  if (!value || value === '0000-00-00' || value === '0000-00-00 00:00:00') return null
  const parsed = dayjs(String(value))
  return parsed.isValid() ? parsed.toDate() : null
}

const toPayloadDate = (value?: Date | null) => {
  return value ? dayjs(value).format('YYYY-MM-DD') : null
}

const resetForm = () => {
  Object.assign(form, createDefaultForm())
  if (props.action === 'add' && props.webhost_id) {
    form.webhost_id = props.webhost_id
  }
}

const fillForm = (data: any) => {
  form.webhost_id = data?.webhost_id ? Number(data.webhost_id) : null
  form.cs_main_project_id = data?.cs_main_project_id ? Number(data.cs_main_project_id) : null
  form.parent_subscription_id = data?.parent_subscription_id ? Number(data.parent_subscription_id) : null
  form.source_type = data?.source_type || 'csmainproject'
  form.service_type = data?.service_type || 'hosting'
  form.start_date = toDate(data?.start_date)
  form.end_date = toDate(data?.end_date)
  form.renewed_from_date = toDate(data?.renewed_from_date)
  form.status = data?.status || 'active'
  form.payment_status = data?.payment_status || 'unpaid'
  form.paid_at = toDate(data?.paid_at)
  form.nominal = data?.nominal ? Number(data.nominal) : 0
  form.description = data?.description || ''
}

const fetchData = async () => {
  if (props.action !== 'edit' || !props.id) {
    resetForm()
    return
  }

  loadingData.value = true
  loadError.value = false

  try {
    const response = await client(`/api/webhost-subscription/${props.id}`)
    fillForm(response)
  } catch (error) {
    console.log(error)
    loadError.value = true
    toast.add({
      severity: 'error',
      summary: 'Error!',
      detail: 'Gagal mengambil data subscription',
      life: 3000,
    })
  } finally {
    loadingData.value = false
  }
}

const submitForm = async () => {
  loadingSubmit.value = true
  errors.value = {}

  const payload = {
    webhost_id: form.webhost_id,
    cs_main_project_id: form.cs_main_project_id,
    parent_subscription_id: form.parent_subscription_id,
    source_type: form.source_type,
    service_type: form.service_type,
    start_date: toPayloadDate(form.start_date),
    end_date: toPayloadDate(form.end_date),
    renewed_from_date: toPayloadDate(form.renewed_from_date),
    status: form.status,
    payment_status: form.payment_status,
    paid_at: toPayloadDate(form.paid_at),
    nominal: form.nominal || 0,
    description: form.description || null,
  }

  try {
    if (props.action === 'edit' && props.id) {
      await client(`/api/webhost-subscription/${props.id}`, {
        method: 'PUT',
        body: payload,
      })
    } else {
      await client('/api/webhost-subscription', {
        method: 'POST',
        body: payload,
      })
    }

    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: props.action === 'edit'
        ? 'Subscription berhasil diupdate'
        : 'Subscription berhasil ditambahkan',
      life: 3000,
    })

    emit('submit')
  } catch (error) {
    console.log(error)
    const sanctumError = useSanctumError(error)
    errors.value = (sanctumError.bag || {}) as FormErrors

    toast.add({
      severity: 'error',
      summary: 'Gagal!',
      detail: props.action === 'edit'
        ? 'Subscription gagal diupdate'
        : 'Subscription gagal ditambahkan',
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
  () => [props.id, props.action, props.webhost_id],
  () => {
    fetchData()
  }
)
</script>
