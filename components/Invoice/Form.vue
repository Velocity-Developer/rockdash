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
  unit: '',
  nama: '',
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

// Inisialisasi form berdasarkan action
watchEffect(() => {
  if (props.action === 'edit' && props.modelValue) {
    // Isi form dengan data yang ada
    form.id = props.modelValue.id;
    form.unit = props.modelValue.unit;
    form.nama = props.modelValue.nama;
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
    form.unit = '';
    form.nama = '';
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
    if (!form.nama) throw { bag: { nama: ['Nama harus diisi'] } };
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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <!-- Unit -->
      <div>
        <label class="block text-sm font-medium mb-1">Unit</label>
        <InputText 
          v-model="form.unit" 
          class="w-full" 
          :class="{'p-invalid': errorSubmit.unit}" 
          placeholder="Masukkan unit"
        />
        <small v-if="errorSubmit.unit" class="p-error block mt-1">{{ errorSubmit.unit[0] }}</small>
      </div>
      
      <!-- Nama -->
      <div>
        <label class="block text-sm font-medium mb-1">Nama</label>
        <InputText 
          v-model="form.nama" 
          class="w-full" 
          :class="{'p-invalid': errorSubmit.nama}" 
          placeholder="Masukkan nama"
        />
        <small v-if="errorSubmit.nama" class="p-error block mt-1">{{ errorSubmit.nama[0] }}</small>
      </div>
      
      <!-- Webhost -->
      <div>
        <label class="block text-sm font-medium mb-1">Webhost</label>
        <SelectWebhost 
          v-model="form.webhost_id" 
          :class="{'p-invalid': errorSubmit.webhost_id}"
        />
        <small v-if="errorSubmit.webhost_id" class="p-error block mt-1">{{ errorSubmit.webhost_id[0] }}</small>
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
    
    <!-- Items -->
    <div class="mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-medium">Items</h3>
        <Button @click="addItem" type="button" icon="pi pi-plus" size="small" label="Tambah Item" />
      </div>
      
      <small v-if="errorSubmit.items" class="p-error block mb-2">{{ errorSubmit.items[0] }}</small>
      
      <div v-for="(item, index) in form.items" :key="index" class="border rounded-lg p-3 mb-3">
        <div class="flex justify-between items-center mb-2">
          <h4 class="font-medium">Item #{{ index + 1 }}</h4>
          <Button 
            @click="removeItem(index)" 
            type="button" 
            icon="pi pi-trash" 
            severity="danger" 
            text 
            :disabled="form.items.length === 1"
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- Nama Item -->
          <div>
            <label class="block text-sm font-medium mb-1">Nama Item</label>
            <InputText 
              v-model="item.nama" 
              class="w-full" 
              :class="{'p-invalid': errorSubmit[`items.${index}.nama`]}" 
              placeholder="Nama item"
            />
            <small v-if="errorSubmit[`items.${index}.nama`]" class="p-error block mt-1">{{ errorSubmit[`items.${index}.nama`][0] }}</small>
          </div>
          
          <!-- Jenis Item -->
          <div>
            <label class="block text-sm font-medium mb-1">Jenis</label>
            <InputText 
              v-model="item.jenis" 
              class="w-full" 
              :class="{'p-invalid': errorSubmit[`items.${index}.jenis`]}" 
              placeholder="Jenis item"
            />
            <small v-if="errorSubmit[`items.${index}.jenis`]" class="p-error block mt-1">{{ errorSubmit[`items.${index}.jenis`][0] }}</small>
          </div>
          
          <!-- Harga Item -->
          <div>
            <label class="block text-sm font-medium mb-1">Harga</label>
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
    
    <!-- Buttons -->
    <div class="flex justify-end gap-2">
      <Button @click="closeForm" type="button" label="Batal" severity="secondary" outlined />
      <Button type="submit" label="Simpan" :loading="loadingSubmit" />
    </div>
  </form>
</template>

<style scoped></style>
