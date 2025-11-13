<script setup lang="ts">
import { DatePicker, FormSelectCsMainProject } from '#components'
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient()
const toast = useToast()

const form = reactive({
  tanggal: dayjs().local().format('DD-MM-YYYY'),
  jenis: '',
  nama_web: '',
  id_webhost: '',
  id_cs_main_project: '',
}) as any

const emit = defineEmits(['submit'])

const loading = ref(false)
const submit = async () => {
  loading.value = true

  //ubah format tanggal
  form.tanggal = dayjs(form.tanggal).format('DD-MM-YYYY')

  try {
    await client('/api/client_support/store', {
      method: 'POST',
      params: form
    })
    emit('submit')
    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: 'Client Support berhasil ditambahkan',
      life: 3000
    });
  } catch (error) {
    console.log(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal!',
      detail: 'Client Support gagal ditambahkan',
      life: 3000
    });
  } finally {
    loading.value = false
  }
}

//watch fomr.jenis
watch(() => form.jenis, (jenis) => {
  if (jenis == 'tanya_jawab') {
    form.id_cs_main_project = ''
  } else {
    form.id_webhost = ''
  }
})
</script>

<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div>
      <label for="form.tanggal">Tanggal</label>
      <DatePicker
        v-model="form.tanggal"
        dateFormat="dd-mm-yy"
        class="w-full"
      />
    </div>
    <div>
      <label for="form.jenis">Jenis</label>
      <Select
        v-model="form.jenis"
        class="w-full"
        placeholder="Jenis Client Support"
        optionValue="value" 
        optionLabel="label"
        :options="[
          {
            label: 'Revisi 1',
            value: 'revisi_1'
          },
          {
            label: 'Perbaikan Revisi 1',
            value: 'perbaikan_revisi_1'
          },
          {
            label: 'Revisi 2',
            value: 'revisi_2'
          },
          {
            label: 'Perbaikan Revisi 2',
            value: 'perbaikan_revisi_2'
          },
          {
            label: 'Tanya Jawab',
            value: 'tanya_jawab'
          },
          {
            label: 'Update Web',
            value: 'update_web'
          }
        ]"
      />
    </div>
    <div v-if="form.jenis && form.jenis == 'tanya_jawab'">
      <label for="form.id_webhost">Webhost</label>
      <FormSelectWebhost v-model="form.id_webhost" />
    </div>
    <div v-if="form.jenis && form.jenis !== 'tanya_jawab'">
      <label for="form.id_cs_main_project">Project</label>
      <FormSelectCsMainProject v-model="form.id_cs_main_project" />
    </div>
    <div class="text-end">      
      <Button type="submit" :loading="loading">
        <Icon name="lucide:save" /> Simpan
      </Button>
    </div>
  </form>
</template>

<style scoped></style>
