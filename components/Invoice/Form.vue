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
  unit: 'vdi',
  nama_klien: '',
  alamat_klien: '',
  telepon_klien: '',
  note: '',
  status: 'belum',
  tanggal: null as any | null,
  jatuh_tempo: null as any | null,
  tanggal_bayar: null as any | null,
  subtotal: 0 as number,
  pajak: '' as string,
  nominal_pajak: 0 as number,
  total: 0 as number,
  items: [] as any[]
});

// State untuk error
const errorSubmit = ref({} as any);
const loadingSubmit = ref(false);

// Status options untuk Select
const statusOptions = [
  { label: 'Belum', value: 'belum' },
  { label: 'Lunas', value: 'lunas' },
  { label: 'Dibatalkan', value: 'dibatalkan' }
];

// Unit options
const unitOptions = [
  { label: 'Velocity Developer Indonesia', value: 'vdi' },
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
    form.telepon_klien = props.modelValue.telepon_klien;
    form.note = props.modelValue.note;
    form.status = props.modelValue.status;
    form.tanggal = props.modelValue.tanggal;
    form.jatuh_tempo = props.modelValue.jatuh_tempo;
    form.tanggal_bayar = props.modelValue.tanggal_bayar;
    form.subtotal = Number(props.modelValue.subtotal || 0);
    form.pajak = props.modelValue.pajak || '';
    form.nominal_pajak = Number(props.modelValue.nominal_pajak || 0);
    form.total = Number(props.modelValue.total || 0);
    
    // Clone items untuk menghindari referensi langsung
    form.items = props.modelValue.items ? [...props.modelValue.items] : [];
  } else {
    // Reset form untuk tambah data baru
    form.id = '';
    form.unit = 'vd';
    form.nama_klien = '';
    form.alamat_klien = '';
    form.telepon_klien = '';
    form.note = '';
    form.status = 'pending';
    form.tanggal = dayjs().format('YYYY-MM-DD');
    form.jatuh_tempo = null;
    form.tanggal_bayar = null;
    form.subtotal = 0;
    form.pajak = '';
    form.nominal_pajak = 0;
    form.total = 0;
    form.items = [createEmptyItem()];
  }
});

// Fungsi untuk membuat item kosong
function createEmptyItem() {
  return {
    id: null,
    webhost_id: null,
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

// Keep subtotal and total in sync with items and nominal_pajak
watch(
  () => [form.items, form.nominal_pajak],
  () => {
    const sub = calculateTotal();
    form.subtotal = sub;
    const pajakNom = Number(form.nominal_pajak || 0);
    form.total = sub + pajakNom;
  },
  { deep: true }
)

// Fungsi untuk submit form
async function submitForm() {
  loadingSubmit.value = true;
  errorSubmit.value = {};
  
  try {
    // Validasi form
    if (!form.unit) throw { bag: { unit: ['Unit harus diisi'] } };
    if (!form.nama_klien) throw { bag: { nama_klien: ['Nama klien harus diisi'] } };
    // Validasi webhost per item
    if (!form.status) throw { bag: { status: ['Status harus dipilih'] } };
    if (!form.tanggal) throw { bag: { tanggal: ['Tanggal harus diisi'] } };
    
    // Validasi items
    if (!form.items.length) throw { bag: { items: ['Minimal harus ada 1 item'] } };
    
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      if (!item.harga) throw { bag: { [`items.${i}.harga`]: ['Harga item harus diisi'] } };
    }
    
    // Format tanggal
    const formData = {
      ...form,
      tanggal: form.tanggal ? dayjs(form.tanggal).format('YYYY-MM-DD') : null,
      jatuh_tempo: form.jatuh_tempo ? dayjs(form.jatuh_tempo).format('YYYY-MM-DD') : null,
      tanggal_bayar: form.tanggal_bayar ? dayjs(form.tanggal_bayar).format('YYYY-MM-DD') : null,
      subtotal: Number(form.subtotal || 0),
      nominal_pajak: Number(form.nominal_pajak || 0),
      total: Number(form.total || 0),
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

// Preview nomor invoice di form (readonly)
const nomorPreview = computed(() => (props.modelValue && props.modelValue.nomor) ? props.modelValue.nomor : 'Auto');

// Format IDR helper
function formatIDR(v?: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(v || 0));
}

</script>

<template>
  <form @submit.prevent="submitForm" class="p-4 space-y-5">
    <!-- Client Information -->
    <div>
      <div class="flex items-center gap-2 text-md font-bold mb-3">
        <Icon name="lucide:user-round" class="text-indigo-700" /> Informasi Klien
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">Nama</label>
          <InputText v-model="form.nama_klien" class="w-full" :class="{ 'p-invalid': errorSubmit.nama_klien }" placeholder="Masukkan nama klien" />
          <small v-if="errorSubmit.nama_klien" class="p-error block mt-1">{{ errorSubmit.nama_klien[0] }}</small>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Telepon</label>
          <InputText v-model="form.telepon_klien" class="w-full" :class="{ 'p-invalid': errorSubmit.telepon_klien }" placeholder="No hp klien" />
          <small v-if="errorSubmit.telepon_klien" class="p-error block mt-1">{{ errorSubmit.telepon_klien[0] }}</small>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-2 mt-3">
        <div>
          <label class="block text-sm font-medium mb-1">Alamat</label>
          <Textarea v-model="form.alamat_klien" class="w-full" autoResize rows="2" placeholder="Masukkan alamat klien" />
        </div>
      </div>
    </div>

    <!-- Invoice Details -->
    <div>
      <div class="flex items-center gap-2 text-md font-bold mb-3">
        <Icon name="lucide:file-text" class="text-green-700" /> Invoice Details
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">Invoice</label>
          <InputText :model-value="nomorPreview" class="w-full" disabled placeholder="Auto generated" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Tanggal</label>
          <DatePicker v-model="form.tanggal" dateFormat="dd/mm/yy" class="w-full" :class="{ 'p-invalid': errorSubmit.tanggal }" />
          <small v-if="errorSubmit.tanggal" class="p-error block mt-1">{{ errorSubmit.tanggal[0] }}</small>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Jatuh tempo</label>
          <DatePicker v-model="form.jatuh_tempo" dateFormat="dd/mm/yy" class="w-full" :class="{ 'p-invalid': errorSubmit.jatuh_tempo }" />
          <small v-if="errorSubmit.jatuh_tempo" class="p-error block mt-1">{{ errorSubmit.jatuh_tempo[0] }}</small>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <div>
          <label class="block text-sm font-medium mb-1">Unit</label>
          <Select v-model="form.unit" :options="unitOptions" optionLabel="label" optionValue="value" class="w-full" :class="{ 'p-invalid': errorSubmit.unit }" placeholder="Select unit" />
          <small v-if="errorSubmit.unit" class="p-error block mt-1">{{ errorSubmit.unit[0] }}</small>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <Select v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" class="w-full" :class="{ 'p-invalid': errorSubmit.status }" placeholder="Select status" />
          <small v-if="errorSubmit.status" class="p-error block mt-1">{{ errorSubmit.status[0] }}</small>
        </div>
      </div>
    </div>

    <!-- Invoice Items -->
    <div class="bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-500 rounded-lg">
      <div class="flex items-center justify-between p-3 border-b">
        <div class="flex items-center gap-2 text-md font-bold">
          <Icon name="lucide:table-properties" class="text-blue-700" /> Item Invoice
        </div>
        <Button @click="addItem" type="button" size="small" severity="info"><Icon name="lucide:plus" /> Add Item</Button>
      </div>

      <div class="p-3">
        <small v-if="errorSubmit.items" class="p-error block mb-2">{{ errorSubmit.items[0] }}</small>

        <div v-for="(item, index) in form.items" :key="index" class="bg-white dark:bg-zinc-700 rounded-lg border dark:border-zinc-800 p-3 mb-3">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div class="md:col-span-3">
              <label class="block text-xs font-medium mb-1">Website</label>
            <InputText v-model="item.webhost_id" class="w-full"/>
              <!-- <SelectWebhost v-model="item.webhost_id" class="w-full" :class="{ 'p-invalid': errorSubmit[`items.${index}.webhost_id`] }" /> -->
              <small v-if="errorSubmit[`items.${index}.webhost_id`]" class="p-error block mt-1">{{ errorSubmit[`items.${index}.webhost_id`][0] }}</small>
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-medium mb-1">Service</label>
              <Select v-model="item.jenis" :options="dataOpsiJenis" class="w-full" :class="{ 'p-invalid': errorSubmit[`items.${index}.jenis`] }" placeholder="Select Service" />
              <small v-if="errorSubmit[`items.${index}.jenis`]" class="p-error block mt-1">{{ errorSubmit[`items.${index}.jenis`][0] }}</small>
            </div>
            <div class="md:col-span-4">
              <label class="block text-xs font-medium mb-1">Nama Item</label>
              <InputText v-model="item.nama" class="w-full" :class="{ 'p-invalid': errorSubmit[`items.${index}.nama`] }" placeholder="Nama/keterangan" />
              <small v-if="errorSubmit[`items.${index}.nama`]" class="p-error block mt-1">{{ errorSubmit[`items.${index}.nama`][0] }}</small>
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-medium mb-1">Harga</label>
              <InputNumber v-model="item.harga" class="w-full" :class="{ 'p-invalid': errorSubmit[`items.${index}.harga`] }" placeholder="0.00" mode="currency" currency="IDR" locale="id-ID" />
              <small v-if="errorSubmit[`items.${index}.harga`]" class="p-error block mt-1">{{ errorSubmit[`items.${index}.harga`][0] }}</small>
            </div>
            <div class="md:col-span-1 md:justify-self-end">
              <Button @click="removeItem(index)" type="button" severity="danger" text :disabled="form.items.length === 1">
                <Icon name="lucide:trash-2" />
              </Button>
            </div>
          </div>
        </div>
       
      </div>
    </div>

     <!-- Summary -->
    <div class="mt-4 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
      <div class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-900 dark:to-sky-950 p-3">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="font-semibold">Subtotal:</div>
          <div class="text-right">{{ formatIDR(form.subtotal) }}</div>
          <div class="font-semibold">Tax:</div>
          <div class="text-right">{{ formatIDR(form.nominal_pajak) }}</div>
          <div class="col-span-2 border border-b-blue-300"></div>
          <div class="font-semibold">Total:</div>
          <div class="text-right font-semibold text-xl">{{ formatIDR(form.total) }}</div>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium mb-1">Notes (Optional)</label>
      <Textarea v-model="form.note" class="w-full" :class="{ 'p-invalid': errorSubmit.note }" placeholder="Add any additional notes or terms..." rows="3" />
      <small v-if="errorSubmit.note" class="p-error block mt-1">{{ errorSubmit.note[0] }}</small>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-2 pt-2">
      <Button @click="closeForm" type="button" severity="secondary" outlined>Batal</Button>
      <Button type="submit" :loading="loadingSubmit">Buat Invoice</Button>
    </div>
  </form>
</template>

<style scoped></style>
