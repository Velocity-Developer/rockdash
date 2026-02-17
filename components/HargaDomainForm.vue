<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="text-sm mb-1 block" for="bulan">Bulan</label>
      <InputText
        id="bulan"
        v-model="form.bulan"
        class="w-full"
        placeholder="Contoh: Januari 2025"
        required
      />
      <Message
        v-if="errors.bulan"
        severity="error"
        size="small"
        class="mt-1"
        closable
      >
        {{ errors.bulan[0] }}
      </Message>
    </div>

    <div>
      <label class="text-sm mb-1 block" for="biaya">Biaya</label>
      <InputNumber
        id="biaya"
        v-model="form.biaya"
        :minFractionDigits="0"
        class="w-full"
        inputClass="w-full"
      />
      <Message
        v-if="errors.biaya"
        severity="error"
        size="small"
        class="mt-1"
        closable
      >
        {{ errors.biaya[0] }}
      </Message>
    </div>

    <div class="flex justify-end">
      <Button type="submit" :loading="loading">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin mr-1" />
        <Icon v-else name="lucide:save" class="mr-1" />
        <span>{{ submitLabel }}</span>
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = defineProps({
  action: {
    type: String,
    default: 'add'
  },
  id: {
    type: [String, Number],
    default: ''
  }
})

const client = useSanctumClient()
const toast = useToast()

const emit = defineEmits(['update'])

const loading = ref(false)
const errors = ref({} as any)

const form = reactive({
  bulan: '',
  biaya: null as number | null
})

const submitLabel = computed(() => {
  return props.action === 'edit' ? 'Update' : 'Simpan'
})

const loadData = async () => {
  if (props.action !== 'edit' || !props.id) {
    return
  }

  loading.value = true
  errors.value = {}

  try {
    const res = await client(`/api/harga-domain/${props.id}`) as any
    form.bulan = res.bulan || ''
    form.biaya = typeof res.biaya_normalized !== 'undefined'
      ? res.biaya_normalized
      : res.biaya ?? null
  } catch (error) {
    const er = useSanctumError(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Gagal memuat data harga domain',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

watch(
  () => props.id,
  () => {
    if (props.action === 'edit') {
      loadData()
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  loading.value = true
  errors.value = {}

  const payload = {
    bulan: form.bulan,
    biaya: form.biaya
  }

  try {
    if (props.action === 'edit' && props.id) {
      await client(`/api/harga-domain/${props.id}`, {
        method: 'PUT',
        body: payload
      })
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Harga domain berhasil diperbarui',
        life: 3000
      })
    } else {
      await client('/api/harga-domain', {
        method: 'POST',
        body: payload
      })
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Harga domain berhasil ditambahkan',
        life: 3000
      })
    }

    emit('update')
  } catch (error) {
    const er = useSanctumError(error)
    errors.value = er.bag || {}
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat menyimpan data',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
