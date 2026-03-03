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
        <DatePicker v-model="theDate" dateFormat="dd/mm/yy"/>
      </div>
    </div>

    <div v-if="loadingUploadFile">
      <Icon name="lucide:loader-circle" class="animate-spin" /> Memproses file...
    </div>

    <form @submit.prevent="submit">

      <table class="w-full text-sm">
        <thead>
          <tr class="bg-blue-600 text-left text-white">
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
          <tr v-for="(form, index) in forms" :key="form.id" class="odd:bg-white dark:odd:bg-zinc-900 even:bg-zinc-100 dark:even:bg-zinc-800">
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
              <FormSelectWebhost :id="`website-${form.id}`" v-model="form.webhost_id" />
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
      <Button @click="submit" :loading="loadingSubmit">
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

const theDate = ref(dayjs().toDate())

const fileupload = ref();
const loadingUploadFile = ref(false);

const onFileSelect = async (event: any) => {
    loadingUploadFile.value = true;

    try {
        const file = event.files[0];
        const reader = new FileReader();

        reader.onload = async (e: any) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0] as any;
                const worksheet = workbook.Sheets[firstSheetName] as any;

                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
                const rows = jsonData.slice(1);

                forms.splice(0, forms.length);
                nextFormId = 1;

                for (const row of rows) {
                    if (!row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
                        continue;
                    }

                    const kategoriName = row[3]?.toString().trim() || '';
                    const categories = dataJournalCategory?.value?.data || [];
                    const kategoriId = kategoriName
                        ? categories.find((c: any) => c.name.trim() === kategoriName)?.id ?? null
                        : null;

                    let webhostId = null;
                    if (row[2]) {
                        const res: any = await client('/api/webhost_search/' + row[2]);
                        webhostId = res?.[0]?.id_webhost ?? null;
                    }

                    forms.push({
                        id: nextFormId++,
                        hp: row[0]?.toString() || '',
                        wa: row[1] || 'XL',
                        website: row[2] || '',
                        webhost_id: webhostId,
                        kategori: kategoriId,
                        mulai: row[4]
                            ? `${dayjs(theDate.value).format('YYYY-MM-DD')} ${row[4]}:00`
                            : '',
                        selesai: row[5]
                            ? `${dayjs(theDate.value).format('YYYY-MM-DD')} ${row[5]}:00`
                            : '',
                        deskripsi: row[6]?row[6]:kategoriName+' '+row[2],
                    });
                }

                if (forms.length === 0) {
                    addForm();
                }

                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `${forms.length} data berhasil diimpor`,
                    life: 3000,
                });
            } catch (err) {
                console.error(err);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Gagal memproses file',
                    life: 3000,
                });
            } finally {
                loadingUploadFile.value = false;
            }
        };

        reader.readAsArrayBuffer(file);
    } catch (error) {
        loadingUploadFile.value = false;
    }
};

const forms = reactive([
  {
    id: 1,
    hp: '',
    wa: 'XL',
    website: 'select',
    webhost_id: null,
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
    webhost_id: lastForm.webhost_id || null,
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

const loadingSubmit = ref(false);
const submit = async (data: any) => {

  if (forms.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Data import kosong',
      detail: 'Silahkan tambahkan data import',
      life: 3000
    })
    return;
  }

  loadingSubmit.value = true;

  try {
    //loop forms
    for (const form of forms) {
      if (form.hp && form.wa && form.website) {
        
        //submit form
        const res: any = await client('/api/journal', {
          method: 'POST',
          body: {
            title: form.deskripsi,
            description: form.deskripsi || '',
            start: form.mulai || '',
            end: form.selesai || '',
            status: 'completed',
            priority: 'medium',
            user_id: data.user_id || null,
            role: 'support',
            webhost_id: form.webhost_id || null,
            journal_category_id: form.kategori || null,
          },
        });
      }
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Data berhasil disimpan',
      life: 3000,
    });
  } catch (err) {
    console.error(err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menyimpan data',
      life: 3000,
    });
  } finally {
    loadingSubmit.value = false;
  }
  

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
