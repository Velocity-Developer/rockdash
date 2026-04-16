<template>
  <div>
    <div v-if="loadingData" class="space-y-3">
      <div v-for="i in 8" :key="i">
        <Skeleton width="30%" height="18px" class="mb-2" />
        <Skeleton width="100%" height="40px" />
      </div>
    </div>
    
    <form v-else class="space-y-4" @submit.prevent="handleSubmit">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50 border border-amber-300 dark:bg-amber-800 dark:border-amber-700 p-4 rounded-md mb-6">
        <div>
          <div class="text-sm mb-1">Nama Web: </div>
          <div>{{ dataCsMainProject?.webhost?.nama_web || '-' }}</div>
        </div>
        <div>
          <div class="text-sm mb-1">Kategori Web: </div>
          <div>{{ dataCsMainProject?.webhost?.kategori || '-' }}</div>
        </div>
        <div>
          <div class="text-sm mb-1">Paket: </div>
          <div>{{ dataCsMainProject?.webhost?.paket?.paket || '-' }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

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
          <label class="mb-1 block" for="kategori_web">Kategori</label>
          <InputText id="kategori_web" v-model="form.kategori_web" class="w-full" />
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
  id_webhost: '',
  jenis: '',
  deskripsi: '',
  trf: null as string | number | null,
  tgl_masuk: null as string | Date | null,
  tgl_deadline: null as string | Date | null,
  biaya: null as string | number | null,
  dibayar: null as string | number | null,
  dikerjakan_oleh: [] as Array<string | number>,
  nama_web: '',
  hp: '',
  wa:'',
  kategori_web: '',
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

const dataCsMainProject = ref({} as any)
const assignForm = (res: any) => {
  form.id = res?.id || ''
  form.jenis = res?.jenis || ''
  form.deskripsi = res?.deskripsi || ''
  form.trf = res?.trf ?? null
  form.tgl_masuk = res?.tgl_masuk || null
  form.tgl_deadline = res?.tgl_deadline || null
  form.biaya = res?.biaya ?? null
  form.dibayar = res?.dibayar ?? null
  form.saldo = res?.webhost?.saldo || ''
  form.dikerjakan_oleh = Array.isArray(res?.raw_dikerjakan) ? res.raw_dikerjakan : []
  form.id_webhost = res?.id_webhost || res?.webhost?.id_webhost || ''
  form.nama_web = res?.webhost?.nama_web || ''
  form.hp = res?.webhost?.hp || ''
  form.wa = res?.webhost?.wa || ''
  form.kategori_web = res?.webhost?.kategori || ''
  dataCsMainProject.value = res
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
    const response = await client(`/api/cs_main_project_origin/${form.id}`, {
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
