<template>
  <div>
    <div v-if="loadingData" class="space-y-3">
      <div v-for="i in 8" :key="i">
        <Skeleton width="30%" height="18px" class="mb-2" />
        <Skeleton width="100%" height="40px" />
      </div>
    </div>

    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block" for="nama_web">Nama Web</label>
          <InputText id="nama_web" v-model="form.nama_web" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="kategori_web">Kategori Web</label>
          <Select
            id="kategori_web"
            v-model="form.kategori_web"
            :options="dataOpsi?.kategori_web || []"
            optionValue="value"
            optionLabel="label"
            filter
            showClear
            editable
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block" for="jenis">Jenis Project</label>
          <Select
            id="jenis"
            v-model="form.jenis"
            :options="dataOpsi?.jenis_project || []"
            filter
            showClear
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block" for="paket">Paket</label>
          <Select
            id="paket"
            v-model="form.paket"
            :options="dataOpsi?.paket || []"
            optionValue="value"
            optionLabel="label"
            filter
            showClear
            class="w-full"
          />
        </div>

        <div class="md:col-span-2">
          <label class="mb-1 block" for="deskripsi">Deskripsi</label>
          <Textarea id="deskripsi" v-model="form.deskripsi" rows="4" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="trf">Trf</label>
          <InputNumber id="trf" v-model="form.trf" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="waktu_plus">Waktu Tambahan</label>
          <InputNumber id="waktu_plus" v-model="form.waktu_plus" showButtons class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="tgl_masuk">Tanggal Masuk</label>
          <DatePicker id="tgl_masuk" v-model="form.tgl_masuk" dateFormat="yy-mm-dd" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="tgl_deadline">Tanggal Deadline</label>
          <DatePicker id="tgl_deadline" v-model="form.tgl_deadline" dateFormat="yy-mm-dd" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="biaya">Biaya</label>
          <InputNumber id="biaya" v-model="form.biaya" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="dibayar">Dibayar</label>
          <InputNumber id="dibayar" v-model="form.dibayar" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="nama">Nama Klien</label>
          <InputText id="nama" v-model="form.nama" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="email">Email</label>
          <InputText id="email" v-model="form.email" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="hp">No. HP</label>
          <InputText id="hp" v-model="form.hp" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="wa">No. WA</label>
          <InputText id="wa" v-model="form.wa" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="telegram">Telegram</label>
          <InputText id="telegram" v-model="form.telegram" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="saldo">Saldo</label>
          <InputText id="saldo" v-model="form.saldo" class="w-full" />
        </div>

        <div>
          <label class="mb-1 block" for="hpads">HP Ads</label>
          <Select
            id="hpads"
            v-model="form.hpads"
            :options="[
              { label: 'Hp Ads', value: 'ya' },
              { label: 'Hp Web', value: 'tidak' }
            ]"
            optionValue="value"
            optionLabel="label"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block" for="id_webhost">ID Webhost</label>
          <InputText id="id_webhost" v-model="form.id_webhost" class="w-full" />
        </div>

        <div class="md:col-span-2">
          <label class="mb-1 block" for="dikerjakan_oleh">Dikerjakan Oleh</label>
          <MultiSelect
            id="dikerjakan_oleh"
            v-model="form.dikerjakan_oleh"
            :options="dataOpsi?.karyawan || []"
            optionValue="value"
            optionLabel="label"
            filter
            showClear
            class="w-full"
          />
        </div>

      </div>

      <Message v-if="fetchError" severity="error">{{ fetchError }}</Message>

      <div class="flex justify-end">
        <Button type="submit" :loading="loadingSubmit">
          <Icon name="lucide:save" />
          Simpan
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'

const dayjs = useDayjs()
const client = useSanctumClient()
const toast = useToast()

type IdType = string | number | null | undefined

const props = defineProps<{
  id: IdType
}>()

const emit = defineEmits<{
  (e: 'submit', value: Record<string, any>): void
}>()

const loadingData = ref(false)
const loadingSubmit = ref(false)
const fetchError = ref('')

const form = reactive({
  id: '',
  jenis: '',
  nama_web: '',
  kategori_web: '',
  paket: null as string | number | null,
  deskripsi: '',
  trf: null as string | number | null,
  tgl_masuk: null as string | Date | null,
  tgl_deadline: null as string | Date | null,
  biaya: null as string | number | null,
  dibayar: null as string | number | null,
  waktu_plus: null as string | number | null,
  saldo: '',
  hp: '',
  telegram: '',
  hpads: '',
  wa: '',
  email: '',
  dikerjakan_oleh: [] as Array<string | number>,
  id_webhost: '',
  invoice_id: '',
  customer_id: '',
  nama: '',
}) as any

const { data: dataOpsi } = await useAsyncData(
  'data_opsi-form-admin-csmainproject',
  () => client('/api/data_opsis?keys[]=paket&keys[]=jenis_project&keys[]=karyawan&keys[]=kategori_web')
) as any

const isLikelyDomain = (value: string) => {
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(value)
}

const normalizeNamaWeb = (value: string) => {
  if (!value) return ''

  const normalizedValue = value
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')

  const noSpaceValue = normalizedValue.replace(/\s+/g, '')
  return isLikelyDomain(noSpaceValue) ? noSpaceValue : normalizedValue
}

const assignForm = (res: any) => {
  form.id = res?.id || ''
  form.jenis = res?.jenis || ''
  form.nama_web = normalizeNamaWeb(res?.webhost?.nama_web || '')
  form.kategori_web = res?.webhost?.kategori || ''
  form.paket = res?.webhost?.paket?.id_paket || null
  form.deskripsi = res?.deskripsi || ''
  form.trf = res?.trf ?? null
  form.tgl_masuk = res?.tgl_masuk || null
  form.tgl_deadline = res?.tgl_deadline || null
  form.biaya = res?.biaya ?? null
  form.dibayar = res?.dibayar ?? null
  form.waktu_plus = res?.cs_main_project_info?.waktu_plus ?? null
  form.saldo = res?.webhost?.saldo || ''
  form.hp = res?.webhost?.hp || ''
  form.telegram = res?.webhost?.telegram || ''
  form.hpads = res?.webhost?.hpads || ''
  form.wa = res?.webhost?.wa || ''
  form.email = res?.webhost?.email || ''
  form.dikerjakan_oleh = Array.isArray(res?.raw_dikerjakan) ? res.raw_dikerjakan : []
  form.id_webhost = res?.id_webhost || res?.webhost?.id_webhost || ''
  form.invoice_id = res?.invoice_id || ''
  form.customer_id = res?.customer_id || ''
  form.nama = res?.webhost?.customers?.[0]?.nama || ''
}

const fetchData = async () => {
  if (!props.id) return

  loadingData.value = true
  fetchError.value = ''

  try {
    const res = await client(`/api/cs_main_project/${props.id}`)
    assignForm(res)
  } catch (error) {
    console.error(error)
    fetchError.value = 'Data project gagal diambil'
    toast.add({
      severity: 'error',
      summary: 'Gagal!',
      detail: 'Data project gagal diambil',
      life: 3000,
    })
  } finally {
    loadingData.value = false
  }
}

const formatDateValue = (value: string | Date | null) => {
  if (!value) return ''
  return dayjs(value).format('YYYY-MM-DD')
}

const handleSubmit = async () => {
  const payload = {
    ...toRaw(form),
    nama_web: normalizeNamaWeb(form.nama_web),
    tgl_masuk: formatDateValue(form.tgl_masuk),
    tgl_deadline: formatDateValue(form.tgl_deadline),
  }

  loadingSubmit.value = true

  try {
    const response = await client(`/api/cs_main_project/${form.id}`, {
      method: 'PUT',
      body: payload,
    })

    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: 'Data project berhasil disimpan',
      life: 3000,
    })

    emit('submit', response as Record<string, any>)
  } catch (error) {
    console.error(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal!',
      detail: 'Data project gagal disimpan',
      life: 3000,
    })
  } finally {
    loadingSubmit.value = false
  }
}

onMounted(fetchData)

watch(
  () => props.id,
  async (newId, oldId) => {
    if (!newId || newId === oldId) return
    await fetchData()
  }
)
</script>
