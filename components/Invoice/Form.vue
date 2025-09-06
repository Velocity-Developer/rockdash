<script setup lang="ts">
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()

interface Props {
  modelValue?: any;
  action: 'add' | 'edit';
}

interface Emits {
  (e: 'update'): void;
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const client = useSanctumClient();
const toast = useToast();

// State untuk form
const form = reactive({
  id: '',
  unit: 'vd',
  nama_klien: '',
  alamat_klien: '',
  webhost_id: null as string | number | null,
  note: '',
  status: 'pending',
  tanggal: null as any | null,
  tanggal_bayar: null as any | null,
  items: [] as any[]
});

// State untuk error
const errorSubmit = ref({} as any);
const loadingSubmit = ref(false);

// Status options untuk dropdown
const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Canceled', value: 'canceled' }
];

// Unit options
const unitOptions = [
  { label: 'Velocity Developer', value: 'vd' },
  { label: 'Velocity Cyber Media', value: 'vcm' },
];

//get opsi jenis
const { data: dataOpsiJenis} = await useAsyncData(
    'data_opsi-jenis_project',
    () => client('/api/data_opsi/jenis_project')
) as any

// Inisialisasi form berdasarkan action
watchEffect(() => {
  if (props.action === 'edit' && props.modelValue) {
    // Isi form dengan data yang ada
    form.id = props.modelValue.id;
    form.unit = props.modelValue.unit;
    form.nama_klien = props.modelValue.nama_klien;
    form.alamat_klien = props.modelValue.alamat_klien;
    form.webhost_id = props.modelValue.webhost_id;
    form.note = props.modelValue.note;
    form.status = props.modelValue.status;
    form.tanggal = props.modelValue.tanggal;
    form.tanggal_bayar = props.modelValue.tanggal_bayar;
    
    // Clone items untuk menghindari referensi langsung
    form.items = props.modelValue.items ? [...props.modelValue.items] : [];
  } else {
    // Reset form untuk tambah data baru
    form.id = '';
    form.unit = 'vd';
    form.nama_klien = '';
    form.alamat_klien = '';
    form.webhost_id = null;
    form.note = '';
    form.status = 'pending';
    form.tanggal = dayjs().format('YYYY-MM-DD');
    form.tanggal_bayar = null;
    form.items = [createEmptyItem()];
  }
});

// Fungsi untuk membuat item kosong
function createEmptyItem() {
  return {
    id: null,
    nama: '',
    jenis: '',
    harga: 0
  };
}

// Fungsi untuk menambah item
function addItem() {
  form.items.push(createEmptyItem());
}

// Fungsi untuk menghapus item
function removeItem(index: number) {
  form.items.splice(index, 1);
}

// Fungsi untuk menghitung total invoice
function calculateTotal() {
  if (!form.items || !form.items.length) return 0;
  return form.items.reduce((sum, item) => sum + (Number(item.harga) || 0), 0);
}

// Fungsi untuk submit form
async function submitForm() {
  loadingSubmit.value = true;
  errorSubmit.value = {};
  
  try {
    // Validasi form
    if (!form.unit) throw { bag: { unit: ['Unit harus diisi'] } };
    if (!form.nama_klien) throw { bag: { nama_klien: ['Nama klien harus diisi'] } };
    if (!form.webhost_id) throw { bag: { webhost_id: ['Webhost harus dipilih'] } };
    if (!form.status) throw { bag: { status: ['Status harus dipilih'] } };
    if (!form.tanggal) throw { bag: { tanggal: ['Tanggal harus diisi'] } };
    
    // Validasi items
    if (!form.items.length) throw { bag: { items: ['Minimal harus ada 1 item'] } };
    
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      if (!item.nama) throw { bag: { [`items.${i}.nama`]: ['Nama item harus diisi'] } };
      if (!item.jenis) throw { bag: { [`items.${i}.jenis`]: ['Jenis item harus diisi'] } };
      if (!item.harga) throw { bag: { [`items.${i}.harga`]: ['Harga item harus diisi'] } };
    }
    
    // Format tanggal
    const formData = {
      ...form,
      tanggal: form.tanggal ? dayjs(form.tanggal).format('YYYY-MM-DD') : null,
      tanggal_bayar: form.tanggal_bayar ? dayjs(form.tanggal_bayar).format('YYYY-MM-DD') : null
    };
    
    // Kirim data ke API
    if (props.action === 'edit') {
      await client(`/api/invoice/${form.id}`, {
        method: 'PUT',
        body: formData
      });
    } else {
      await client('/api/invoice', {
        method: 'POST',
        body: formData
      });
    }
    
    // Tampilkan pesan sukses
    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: 'Data invoice berhasil disimpan',
      life: 3000
    });
    
    // Emit event update dan close
    emit('update');
    emit('close');
  } catch (error) {
    const er = useSanctumError(error);
    errorSubmit.value = er.bag;
    
    toast.add({
      severity: 'error',
      summary: 'Gagal!',
      detail: er.msg || 'Terjadi kesalahan saat menyimpan data',
      life: 3000
    });
  }
  
  loadingSubmit.value = false;
}

// Fungsi untuk menutup form
function closeForm() {
  emit('close');
}
</script>

<template>
  <form @submit.prevent="submitForm" class="p-4">

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-start">

      <!-- Info Klien -->
      <div class="grid grid-cols-1 gap-2">
        <div class="flex items-center gap-2 text-md font-bold mb-3">
          <Icon name="lucide:circle-user" class="text-indigo-700"/> Info Klien
        </div>
        <!-- Nama Klien -->
        <div>
          <label class="block text-sm font-medium mb-1">Nama Klien</label>
          <InputText 
            v-model="form.nama_klien" 
            class="w-full" 
            :class="{'p-invalid': errorSubmit.nama_klien}" 
            placeholder="Masukkan nama klien"
          />
          <small v-if="errorSubmit.nama_klien" class="p-error block mt-1">{{ errorSubmit.nama_klien[0] }}</small>
        </div>
        <!-- Alamat Klien -->
        <div>
          <label class="block text-sm font-medium mb-1">Alamat Klien</label>
          <Textarea 
            v-model="form.alamat_klien" 
            class="w-full" 
            autoResize
            rows="2"
            placeholder="Masukkan alamat klien"
          />
        </div>
        <!-- Webhost -->
        <div>
          <label class="block text-sm font-medium mb-1">Website</label>
          <SelectWebhost 
            v-model="form.webhost_id" 
            :class="{'p-invalid': errorSubmit.webhost_id}"
          />
          <small v-if="errorSubmit.webhost_id" class="p-error block mt-1">{{ errorSubmit.webhost_id[0] }}</small>
        </div>
        <!-- Tanggal Bayar -->
        <div>
          <label class="block text-sm font-medium mb-1">Tanggal Bayar</label>
          <DatePicker 
            v-model="form.tanggal_bayar" 
            dateFormat="dd/mm/yy" 
            class="w-full" 
            :class="{'p-invalid': errorSubmit.tanggal_bayar}" 
            placeholder="Pilih tanggal bayar"
          />
          <small v-if="errorSubmit.tanggal_bayar" class="p-error block mt-1">{{ errorSubmit.tanggal_bayar[0] }}</small>
        </div>
       
      </div>

      <!-- Info Invoice -->
      <div class="grid grid-cols-1 gap-2">
        <div class="flex items-center gap-2 text-md font-bold mb-3">
          <Icon name="lucide:file-text" class="text-indigo-700"/> Info Invoice
        </div>
         <!-- Unit -->
        <div>
          <label class="block text-sm font-medium mb-1">Unit</label>
          <Dropdown
            v-model="form.unit"
            :options="unitOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :class="{'p-invalid': errorSubmit.unit}"
            placeholder="Pilih unit"
          />
          <small v-if="errorSubmit.unit" class="p-error block mt-1">{{ errorSubmit.unit[0] }}</small>
        </div>
        <!-- Status -->
        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <Dropdown 
            v-model="form.status" 
            :options="statusOptions" 
            optionLabel="label" 
            optionValue="value" 
            class="w-full" 
            :class="{'p-invalid': errorSubmit.status}" 
            placeholder="Pilih status"
          />
          <small v-if="errorSubmit.status" class="p-error block mt-1">{{ errorSubmit.status[0] }}</small>
        </div>
        
        <!-- Tanggal -->
        <div>
          <label class="block text-sm font-medium mb-1">Tanggal</label>
          <DatePicker 
            v-model="form.tanggal" 
            dateFormat="dd/mm/yy" 
            class="w-full" 
            :class="{'p-invalid': errorSubmit.tanggal}" 
            placeholder="Pilih tanggal"
          />
          <small v-if="errorSubmit.tanggal" class="p-error block mt-1">{{ errorSubmit.tanggal[0] }}</small>
        </div>
                
      </div>

    </div>
  
        
    <!-- Items -->
    <div class="mb-4 bg-gray-50 border border-gray-300 rounded-lg p-3">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-2 text-md font-bold mb-3">
          <Icon name="lucide:scroll-text" class="text-indigo-700"/> Items
        </div>
        <Button @click="addItem" type="button" size="small" severity="info">
          <Icon name="lucide:plus"/> Item
        </Button>
      </div>
      
      <small v-if="errorSubmit.items" class="p-error block mb-2">{{ errorSubmit.items[0] }}</small>
      
      <div v-for="(item, index) in form.items" :key="index" class="border bg-white shadow rounded-lg p-3 mb-3">
        <div class="flex justify-between items-center mb-2">
          <h4 class="font-medium">#{{ index + 1 }}</h4>
          <Button 
            @click="removeItem(index)" 
            type="button"
            severity="danger" text
            :disabled="form.items.length === 1"
          >
            <Icon name="lucide:trash-2"/>
          </Button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- Jenis Item -->
          <div>
            <Select
              v-model="item.jenis"
              :options="dataOpsiJenis"
              class="w-full"
              :class="{'p-invalid': errorSubmit[`items.${index}.jenis`]}"
              placeholder="Pilih jenis item"
            />
            <small v-if="errorSubmit[`items.${index}.jenis`]" class="p-error block mt-1">{{ errorSubmit[`items.${index}.jenis`][0] }}</small>
          </div>

          <!-- Nama Item -->
          <div>
            <InputText 
              v-model="item.nama" 
              class="w-full" 
              :class="{'p-invalid': errorSubmit[`items.${index}.nama`]}" 
              placeholder="Nama item"
            />
            <small v-if="errorSubmit[`items.${index}.nama`]" class="p-error block mt-1">{{ errorSubmit[`items.${index}.nama`][0] }}</small>
          </div>                    
          
          <!-- Harga Item -->
          <div>
            <InputNumber 
              v-model="item.harga" 
              class="w-full" 
              :class="{'p-invalid': errorSubmit[`items.${index}.harga`]}" 
              placeholder="Harga item" 
              mode="currency" 
              currency="IDR" 
              locale="id-ID"
            />
            <small v-if="errorSubmit[`items.${index}.harga`]" class="p-error block mt-1">{{ errorSubmit[`items.${index}.harga`][0] }}</small>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Total -->
    <div class="mb-4 text-right">
      <div class="text-sm font-medium">Total:</div>
      <div class="text-xl font-bold">{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculateTotal()) }}</div>
    </div>

     <!-- Catatan -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Catatan</label>
        <Textarea 
          v-model="form.note" 
          class="w-full" 
          :class="{'p-invalid': errorSubmit.note}" 
          placeholder="Masukkan catatan"
          rows="3"
        />
        <small v-if="errorSubmit.note" class="p-error block mt-1">{{ errorSubmit.note[0] }}</small>
      </div>
    
    <!-- Buttons -->
    <div class="flex justify-end gap-2">
      <Button @click="closeForm" type="button" label="Batal" severity="secondary" outlined />
      <Button type="submit" label="Simpan" :loading="loadingSubmit" />
    </div>
  </form>
</template>

<style scoped></style>
