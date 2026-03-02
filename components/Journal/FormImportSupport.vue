<template>
  <div class="space-y-4">
    
    <div class="flex justify-between">
      <div>
        <div class="card flex flex-wrap gap-6 items-center justify-between">
            <FileUpload ref="fileupload" mode="basic" name="demo[]" url="/api/upload" accept=".xlsx" :maxFileSize="1000000" @upload="onUpload" />
        </div>
      </div>
      <div>
        <label for="date" class="block w-full">Tanggal</label>
        <DatePicker v-model="date" dateFormat="dd/mm/yy"/>
      </div>
    </div>

    <form @submit.prevent="submit">

      <div v-for="form in forms" :key="form.hp">
       <div class="flex">
        {{ form }}
       </div>
      </div>

    </form>

    <div class="flex items-center justify-end gap-1 mt-6">
      <Button @click="submit" severity="contrast">
        <Icon name="lucide:x" /> Reset
      </Button>
      <Button @click="submit" severity="info">
        <Icon name="lucide:upload" /> Proses CSV
      </Button>
      <Button @click="submit">
        <Icon name="lucide:save" /> Submit
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const toast = useToast();
const client = useSanctumClient();

const date = ref(dayjs().toDate())

const fileupload = ref();
const onUpload = () => {
    fileupload.value.upload();
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
}

const forms = reactive([
  {
    hp: '',
    wa: 'XL',
    website: 'select',
    kategori: null,
    mulai:'',
    selesai:'',
    deskripsi: '',
  },
])

const submit = (data: any) => {
    toast.add({
      severity: 'error',
      summary: 'Fitur belum tersedia !',
      detail: 'Mohon maaf, fitur sedang dalam pengembangan',
      life: 3000
    })
}

const { data: dataJournalCategory, status: statusDataJournalCategory} = await useAsyncData(
    'journal-category-support-',
    () => client('/api/journal_category',{
      params: {
        role: 'support',
        per_page: 100 
      }
    })
) as any
</script>
