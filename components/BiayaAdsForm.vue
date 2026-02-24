<script setup lang="ts">
import Kategori from '~/pages/bank_transaksi/[kategori].vue';

const props = defineProps({
  action: {
    type: String,
    default: 'add'
  },
  bulan: {
    type: String,
    default: ''
  },
  kategori: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update'])
const submitLabel = computed(() => {
  return props.action === 'edit' ? 'Update' : 'Simpan'
})

const toast = useToast();
const client = useSanctumClient();
const BiayaAds = computed(() => {
  return dataBiayaAds.value?.data[0] ?? {}
}) as any

//get data BiayaAds
const { data: dataBiayaAds,status: statusBiayaAds} = await useAsyncData(
    'biaya-ads-'+props.bulan+props.kategori,
    () => client('/api/biaya-ads',{
      params:{
        bulan: props.bulan,
        kategori: props.kategori
      }
    })
) as any

const form = reactive({
  bulan: BiayaAds.value.bulan || null,
  biaya: BiayaAds.value.biaya || null,
  kategori: BiayaAds.value.kategori
})

const loading = ref(false)
const errors = ref({} as any)
const handleSubmit = async () => {
  loading.value = true
  errors.value = {}

  const payload = {
    bulan: form.bulan,
    biaya: form.biaya,
    kategori: form.kategori
  }

  try {
    if (BiayaAds.value.id) {
      await client(`/api/biaya-ads/${BiayaAds.value.id}`, {
        method: 'PUT',
        body: payload
      })
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Biaya ads berhasil diperbarui',
        life: 3000
      })
    } else {
      await client('/api/biaya-ads', {
        method: 'POST',
        body: payload
      })
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Biaya ads berhasil ditambahkan',
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

<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <div>
      <label class="text-sm mb-1 block" for="bulan">Bulan</label>
      <InputText
        id="bulan"
        v-model="form.bulan"
        class="w-full"
        placeholder="Contoh: Januari 2025"
        required
      />
    </div>
    <div>
      <label class="text-sm mb-1 block" for="biaya">Biaya</label>
      <InputNumber
        id="biaya"
        v-model="form.biaya"
        :minFractionDigits="0"
        mode="currency" currency="IDR"
        class="w-full"
        inputClass="w-full"
      />
    </div>
    <div class="flex justify-end">
      <Button type="submit" :loading="loading">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
        <Icon v-else name="lucide:save" />
        <span>{{ submitLabel }}</span>
      </Button>
    </div>
  </form>
</template>
