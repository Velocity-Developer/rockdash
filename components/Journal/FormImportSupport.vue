<template>
  <div class="space-y-4">
    
    <div class="flex justify-between">
      <div>
        <div class="card flex flex-wrap gap-6 items-center justify-between">
            <FileUpload 
              ref="fileupload" 
              mode="basic" 
              name="demo[]" 
              accept=".xlsx" 
              :maxFileSize="1000000" 
              @select="onFileSelect" 
              :auto="true"
              chooseLabel="Upload Excel"
            />
        </div>
      </div>
      <div>
        <label for="date" class="block w-full">Tanggal</label>
        <DatePicker v-model="date" dateFormat="dd/mm/yy"/>
      </div>
    </div>

    <form @submit.prevent="submit">

      <table class="w-full text-sm">
        <thead>
          <tr class="bg-zinc-200 text-left">
            <th class="px-2 py-1">HP</th>
            <th class="px-2 py-1">WA</th>
            <th class="px-2 py-1">Website</th>
            <th class="px-2 py-1">Kategori</th>
            <th class="px-2 py-1">Mulai</th>
            <th class="px-2 py-1">Selesai</th>
            <th class="px-2 py-1">Deskripsi</th>
            <th class="px-2 py-1"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(form, index) in forms" :key="form.id">
            <td class="border-b px-2 py-1">
              <InputText :id="`hp-${form.id}`" v-model="form.hp" size="small" />
            </td>
            <td class="border-b px-2 py-1">
              <Select
                :id="`wa-${form.id}`"
                v-model="form.wa"
                :options="['XL','Tsel']"
                placeholder="Pilih" size="small"
              />
            </td>
            <td class="border-b px-2 py-1">
              <InputText :id="`website-${form.id}`" v-model="form.website" size="small" />
            </td>
            <td class="border-b px-2 py-1">
              <Select
                :id="`kategori-${form.id}`"
                v-model="form.kategori"
                :options="dataJournalCategory?.data"
                optionLabel="name"
                optionValue="id"
                placeholder="Pilih Kategori" size="small"
              />
            </td>
            <td class="border-b px-2 py-1">
              <InputText :id="`mulai-${form.id}`" v-model="form.mulai" size="small"/>
            </td>
            <td class="border-b px-2 py-1">
              <InputText :id="`selesai-${form.id}`" v-model="form.selesai" size="small"/>
            </td>
            <td class="border-b px-2 py-1">
              <Textarea :id="`deskripsi-${form.id}`" v-model="form.deskripsi" size="small"/>
            </td>
            <td class="border-b px-2 py-1">              
              <div class="flex gap-1">
                <Button v-if="forms.length > 1" @click="removeForm(form.id)" severity="danger" size="small">
                  <Icon name="lucide:minus" />
                </Button>
                <Button v-if="index === forms.length - 1" @click="addForm" severity="success" size="small">
                  <Icon name="lucide:plus" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

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
import * as XLSX from 'xlsx';
const dayjs = useDayjs()
const toast = useToast();
const client = useSanctumClient();

const date = ref(dayjs().toDate())

const fileupload = ref();
const onFileSelect = (event: any) => {
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0] as any;
        const worksheet = workbook.Sheets[firstSheetName] as XLSX.WorkSheet;
        
        // Konversi ke array of arrays (header: 1)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Ambil data (asumsi baris pertama adalah header, jadi kita lewati)
        const rows = jsonData.slice(1);
        
        // Bersihkan forms yang ada dan reset nextFormId
        forms.splice(0, forms.length);
        nextFormId = 1;
        
        rows.forEach((row: any[]) => {
             // Pastikan baris memiliki setidaknya satu data yang tidak kosong
             if (row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
                 // Urutan: HP, WA, Website, Kategori, Mulai, Selesai, Deskripsi
                 forms.push({
                     id: nextFormId++,
                     hp: row[0] ? String(row[0]) : '',
                     wa: row[1] || 'WA',
                     website: row[2] || '',
                     kategori: row[3] || null,
                     mulai: row[4] || '',
                     selesai: row[5] || '',
                     deskripsi: row[6] || '',
                 });
             }
         });
         
         if (forms.length === 0) {
            // Jika tidak ada data yang berhasil diimpor, tambahkan satu form kosong
            addForm();
         }
        
        toast.add({ severity: 'success', summary: 'Success', detail: `${forms.length} data berhasil diimpor`, life: 3000 });
    };
    reader.readAsArrayBuffer(file);
}

const forms = reactive([
  {
    id: 1,
    hp: '',
    wa: 'XL',
    website: 'select',
    kategori: null,
    mulai:'',
    selesai:'',
    deskripsi: '',
  },
])

let nextFormId = 2;

const addForm = () => {
  const lastForm = forms[forms.length - 1] || {} as any;
  forms.push({
    hp: lastForm.hp || '',
    wa: lastForm.wa || '',
    website: lastForm.website || '',
    kategori: lastForm.kategori || null,
    mulai: lastForm.mulai || '',
    selesai: lastForm.selesai || '',
    deskripsi: lastForm.deskripsi || '',
    id: nextFormId++,
  });
};

const removeForm = (id: number) => {
  if (forms.length > 1) {
    const index = forms.findIndex(form => form.id === id);
    if (index !== -1) {
      forms.splice(index, 1);
    }
  }
};

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
