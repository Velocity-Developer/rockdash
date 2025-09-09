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
  nomor:'',
  unit: 'vdi',
  nama_klien: '',
  email_klien: '',
  alamat_klien: '',
  telepon_klien: '',
  customer_id: null as number | null,
  note: '',
  status: 'belum',
  tanggal: null as any | null,
  jatuh_tempo: null as any | null,
  tanggal_bayar: null as any | null,
  subtotal: 0 as number,
  pajak: 0 as number,
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

// Customer picker state
const customerOptions = ref<any[]>([]);
const selectedCustomerId = ref<number | null>(null);
const showCustomerPicker = ref(false);
const isSearchingCustomer = ref(false);
let customerSearchTimer: any = null;

// All customers for edit mode
const allCustomers = ref<any[]>([]);
const loadingAllCustomers = ref(false);

// Webhost search state
const webhostSearchResults = ref<any[]>([]);
const showWebhostDialog = ref(false);
const isSearchingWebhost = ref(false);
const currentItemIndex = ref<number | null>(null);
let webhostSearchTimer: any = null;

// Load all customers for edit mode
async function loadAllCustomers() {
  if (props.action !== 'edit') return;
  try {
    loadingAllCustomers.value = true;
    const res: any = await client('/api/customer', { params: { per_page: 1000 } });
    const items = res?.data ?? res?.data?.data ?? res?.data ?? res?.items ?? res;
    const list = Array.isArray(items?.data) ? items.data : (Array.isArray(items) ? items : []);
    allCustomers.value = list.map((c: any) => ({
      id: c.id,
      label: `${c.nama}${c.email ? ' · ' + c.email : ''}${c.hp ? ' · ' + c.hp : ''}`,
      value: c.id,
      raw: c,
    }));
    
    // Jika ada customer_id, ambil data customer dan isi form
    if (form.customer_id) {
      await loadCustomerData(form.customer_id);
    }
  } catch (e) {
    allCustomers.value = [];
  } finally {
    loadingAllCustomers.value = false;
  }
}

// Load specific customer data by ID
async function loadCustomerData(customerId: number) {
  try {
    const res: any = await client(`/api/customer/${customerId}`);
    const customer = res?.data ?? res;
    if (customer) {
      // Isi form dengan data customer
      form.nama_klien = customer.nama || form.nama_klien;
      form.email_klien = customer.email || form.email_klien;
      form.telepon_klien = customer.hp || form.telepon_klien;
      form.alamat_klien = customer.alamat || form.alamat_klien;
    }
  } catch (e) {
    console.error('Error loading customer data:', e);
  }
}

// Search webhost by website name
async function searchWebhost(websiteName: string, itemIndex: number) {
  if (!websiteName || websiteName.trim().length < 2) {
    webhostSearchResults.value = [];
    showWebhostDialog.value = false;
    return;
  }
  
  try {
    isSearchingWebhost.value = true;
    currentItemIndex.value = itemIndex;
    const res: any = await client('/api/webhost', { 
      params: { 
        q: websiteName.trim(),
        per_page: 10 
      } 
    });
    const items = res?.data ?? res?.data?.data ?? res?.data ?? res?.items ?? res;
    const list = Array.isArray(items?.data) ? items.data : (Array.isArray(items) ? items : []);
    
    webhostSearchResults.value = list.map((w: any) => ({
      id: w.id,
      nama: w.nama,
      domain: w.domain,
      customer: w.customer?.nama || 'N/A',
      label: `${w.nama} (${w.domain})`,
      value: w.id,
      raw: w,
    }));
    
    if (webhostSearchResults.value.length > 0) {
      showWebhostDialog.value = true;
    }
  } catch (e) {
    console.error('Error searching webhost:', e);
    webhostSearchResults.value = [];
  } finally {
    isSearchingWebhost.value = false;
  }
}

// Handle website input with debounce
function onWebsiteInput(value: string, itemIndex: number) {
  if (webhostSearchTimer) clearTimeout(webhostSearchTimer);
  webhostSearchTimer = setTimeout(() => {
    searchWebhost(value, itemIndex);
  }, 500);
}

// Select webhost from search results
function selectWebhost(webhost: any) {
  if (currentItemIndex.value !== null) {
    const item = form.items[currentItemIndex.value];
    item.webhost_id = webhost.id;
    item.website = webhost.nama;
  }
  showWebhostDialog.value = false;
  currentItemIndex.value = null;
}

// Cari customer dari backend
async function searchCustomers() {
  const hasName = !!form.nama_klien && String(form.nama_klien).trim().length > 1;
  const contact = form.telepon_klien || form.email_klien;
  const hasContact = !!contact && String(contact).trim().length > 2;
  if (!hasName || !hasContact) {
    showCustomerPicker.value = false;
    customerOptions.value = [];
    return;
  }
  try {
    isSearchingCustomer.value = true;
    showCustomerPicker.value = true;
    const q = String(contact || form.nama_klien);
    const res: any = await client('/api/customer', { params: { q, per_page: 10 } });
    const items = res?.data ?? res?.data?.data ?? res?.data ?? res?.items ?? res;
    const list = Array.isArray(items?.data) ? items.data : (Array.isArray(items) ? items : []);
    customerOptions.value = list.map((c: any) => ({
      id: c.id,
      label: `${c.nama}${c.email ? ' · ' + c.email : ''}${c.hp ? ' · ' + c.hp : ''}`,
      value: c.id,
      raw: c,
    }));
  } catch (e) {
    customerOptions.value = [];
  } finally {
    isSearchingCustomer.value = false;
  }
}

// Trigger search when name and (phone/email) present with debounce
watch(
  () => [form.nama_klien, form.telepon_klien, form.email_klien],
  () => {
    if (customerSearchTimer) clearTimeout(customerSearchTimer);
    customerSearchTimer = setTimeout(searchCustomers, 400);
  },
  { deep: true }
)

// Watch selectedCustomerId to update form.customer_id
watch(selectedCustomerId, async (newValue) => {
  form.customer_id = newValue;
  
  // Jika memilih customer, load data customer tersebut
  if (newValue && props.action === 'edit') {
    await loadCustomerData(newValue);
  }
})

// Inisialisasi form berdasarkan action
watchEffect(() => {
  if (props.action === 'edit' && props.modelValue) {
    // Load all customers for edit mode
    loadAllCustomers();
    
    // Isi form dengan data yang ada
    form.id = props.modelValue.id;
    form.nomor = props.modelValue.nomor;
    form.unit = props.modelValue.unit;
    form.nama_klien = props.modelValue.nama_klien;
    form.email_klien = props.modelValue.email_klien;
    form.alamat_klien = props.modelValue.alamat_klien;
    form.telepon_klien = props.modelValue.telepon_klien;
    form.customer_id = props.modelValue.customer_id ?? null;
    selectedCustomerId.value = form.customer_id;
    form.note = props.modelValue.note;
    form.status = props.modelValue.status;
    form.tanggal = props.modelValue.tanggal;
    form.jatuh_tempo = props.modelValue.jatuh_tempo;
    form.tanggal_bayar = props.modelValue.tanggal_bayar;
    form.subtotal = Number(props.modelValue.subtotal || 0);
    form.pajak = Number(props.modelValue.pajak || 0);
    form.nominal_pajak = Number(props.modelValue.nominal_pajak || 0);
    form.total = Number(props.modelValue.total || 0);
    
    // Clone items untuk menghindari referensi langsung
    form.items = props.modelValue.items ? [...props.modelValue.items] : [];
  } else {
    // Reset form untuk tambah data baru
    form.id = '';
    form.unit = 'vd';
    form.nama_klien = '';
    form.email_klien = '';
    form.alamat_klien = '';
    form.telepon_klien = '';
    form.customer_id = null;
    form.note = '';
    form.status = 'pending';
    form.tanggal = dayjs().format('YYYY-MM-DD');
    form.jatuh_tempo = null;
    form.tanggal_bayar = null;
    form.subtotal = 0;
    form.pajak = 2.5;
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
    website: null,
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

// Keep subtotal in sync with items
watch(
  () => form.items,
  () => {
    form.subtotal = calculateTotal();
  },
  { deep: true }
)

// Derive nominal_pajak and total from subtotal and pajak
watch(
  () => [form.subtotal, form.pajak],
  () => {
    const sub = Number(form.subtotal || 0);
    const percent = toNumberLocale(form.pajak);
    const pajakNom = sub * (percent / 100);
    form.nominal_pajak = pajakNom;
    form.total = sub + pajakNom;
  },
  { deep: true, immediate: true }
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
    
    // Pastikan customer_id: pilih yang ada, jika tidak, buat customer baru
    let customerId = selectedCustomerId.value || form.customer_id;
    if (!customerId) {
      // buat customer baru
      const cust: any = await client('/api/customer', {
        method: 'POST',
        body: {
          nama: form.nama_klien,
          email: form.email_klien || null,
          hp: form.telepon_klien || null,
          alamat: form.alamat_klien || null,
        }
      });
      customerId = cust?.id ?? cust?.data?.id ?? null;
      if (!customerId) throw { bag: { customer_id: ['Gagal membuat customer'] } };
    }

    // Format tanggal & bentuk payload invoice
    const formData: any = {
      unit: form.unit,
      customer_id: customerId,
      note: form.note,
      status: form.status,
      pajak: String(form.pajak ?? ''),
      tanggal: form.tanggal ? dayjs(form.tanggal).format('YYYY-MM-DD') : null,
      jatuh_tempo: form.jatuh_tempo ? dayjs(form.jatuh_tempo).format('YYYY-MM-DD') : null,
      tanggal_bayar: form.tanggal_bayar ? dayjs(form.tanggal_bayar).format('YYYY-MM-DD') : null,
      subtotal: Number(form.subtotal || 0),
      nominal_pajak: Number(form.nominal_pajak || 0),
      total: Number(form.total || 0),
      items: form.items.map((it: any) => ({ id: it.id, webhost_id: it.webhost_id, nama: it.nama, jenis: it.jenis, harga: Number(it.harga || 0) })),
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

// Safely parse numbers with comma decimal
function toNumberLocale(v: any): number {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    // remove thousand separators and normalize decimal comma
    const normalized = v.replace(/\./g, '').replace(',', '.');
    const n = parseFloat(normalized);
    return isNaN(n) ? 0 : n;
  }
  try { return Number(v) || 0 } catch { return 0 }
}

</script>

<template>
  <form @submit.prevent="submitForm" class="p-4 space-y-5">
    <!-- Client Information -->
    <div>
      <div class="flex items-center gap-2 text-md font-bold mb-3">
        <Icon name="lucide:user-round" class="text-indigo-700" /> Informasi Klien
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <InputText v-model="form.email_klien" type="email" class="w-full" :class="{ 'p-invalid': errorSubmit.email_klien }" placeholder="Email klien" />
          <small v-if="errorSubmit.email_klien" class="p-error block mt-1">{{ errorSubmit.email_klien[0] }}</small>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-2 mt-3">
        <div>
          <label class="block text-sm font-medium mb-1">Alamat</label>
          <Textarea v-model="form.alamat_klien" class="w-full" autoResize rows="2" placeholder="Masukkan alamat klien" />
        </div>
      </div>

      <!-- Picker Customer -->
      <div v-if="showCustomerPicker" class="mt-3 p-3 border rounded-md bg-indigo-50 border-indigo-300 dark:bg-indigo-950 dark:border-indigo-800">
        <div class="flex items-center justify-between mb-2">
          <div class="font-medium">Pilih Customer</div>
          <div class="text-xs" v-if="isSearchingCustomer">mencari...</div>
        </div>
        <div v-if="customerOptions.length">
          <Select
            v-model="selectedCustomerId"
            :options="customerOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih customer yang cocok"
            class="w-full" showClear 
          />
          <small class="block mt-1 text-xs opacity-70">Atau biarkan kosong untuk membuat customer baru.</small>
        </div>
        <div v-else class="text-sm opacity-70">Tidak ditemukan customer cocok. Customer baru akan dibuat saat simpan.</div>
        <small v-if="errorSubmit.customer_id" class="p-error block mt-1">{{ errorSubmit.customer_id[0] }}</small>
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
          <DatePicker v-model="form.tanggal" showTime hourFormat="24" dateFormat="dd/mm/yy" class="w-full" :class="{ 'p-invalid': errorSubmit.tanggal }" />
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
        <div>
          <label class="block text-sm font-medium mb-1">Tanggal bayar</label>
          <DatePicker v-model="form.tanggal_bayar" showTime hourFormat="24" dateFormat="dd/mm/yy" class="w-full" :class="{ 'p-invalid': errorSubmit.tanggal_bayar }" />
          <small v-if="errorSubmit.tanggal_bayar" class="p-error block mt-1">{{ errorSubmit.tanggal_bayar[0] }}</small>
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
            <!-- <div class="md:col-span-3">
              <label class="block text-xs font-medium mb-1">Website</label>
              <InputText 
                v-model="item.website" 
                class="w-full" 
                @input="(e) => onWebsiteInput((e?.target as HTMLInputElement)?.value ?? '', index)"
                placeholder="Ketik nama website..."
              />
              <small v-if="errorSubmit[`items.${index}.website`]" class="p-error block mt-1">{{ errorSubmit[`items.${index}.website`][0] }}</small>
            </div> -->
            <div class="md:col-span-3">
              <label class="block text-xs font-medium mb-1">Jenis</label>
              <Select v-model="item.jenis" :options="dataOpsiJenis" showClear class="w-full" :class="{ 'p-invalid': errorSubmit[`items.${index}.jenis`] }" placeholder="Jenis layanan" />
              <small v-if="errorSubmit[`items.${index}.jenis`]" class="p-error block mt-1">{{ errorSubmit[`items.${index}.jenis`][0] }}</small>
            </div>
            <div class="md:col-span-5">
              <label class="block text-xs font-medium mb-1">Nama Item</label>
              <InputText v-model="item.nama" class="w-full" :class="{ 'p-invalid': errorSubmit[`items.${index}.nama`] }" placeholder="Nama/keterangan" />
              <small v-if="errorSubmit[`items.${index}.nama`]" class="p-error block mt-1">{{ errorSubmit[`items.${index}.nama`][0] }}</small>
            </div>
            <div class="md:col-span-3">
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
          <div class="font-semibold">Pajak:</div>
          <div class="text-right">
            <InputNumber
              v-model="form.pajak"
              class="w-[120px] overflow-hidden rounded-md border-none"
              fluid
              mode="decimal"
              locale="id-ID"
              :minFractionDigits="0"
              :maxFractionDigits="2"
              suffix="%"
              :class="{ 'p-invalid': errorSubmit.pajak }"
              size="small"
              placeholder="0,00"
            />
          </div>
          <div class="font-semibold">Nominal Pajak:</div>
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
      <Button type="submit" :loading="loadingSubmit">
        <span v-if="props.action === 'edit' && props.modelValue">Update Invoice</span>
        <span v-else>Buat Invoice</span>
      </Button>
    </div>
  </form>

  <!-- Webhost Search Dialog -->
  <Dialog 
    v-model:visible="showWebhostDialog" 
    modal 
    header="Pilih Webhost" 
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="mb-3">
      <div class="flex items-center gap-2 mb-2">
        <Icon name="lucide:search" class="text-gray-500" />
        <span class="text-sm text-gray-600">Hasil pencarian webhost:</span>
        <div v-if="isSearchingWebhost" class="text-xs text-blue-600">mencari...</div>
      </div>
    </div>
    
    <div v-if="webhostSearchResults.length > 0" class="space-y-2">
      <div 
        v-for="webhost in webhostSearchResults" 
        :key="webhost.id"
        class="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        @click="selectWebhost(webhost)"
      >
        <div class="font-medium">{{ webhost.nama }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">{{ webhost.domain }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-500">Customer: {{ webhost.customer }}</div>
      </div>
    </div>
    
    <div v-else-if="!isSearchingWebhost" class="text-center py-4 text-gray-500">
      Tidak ditemukan webhost yang cocok
    </div>
    
    <template #footer>
      <Button 
        @click="showWebhostDialog = false" 
        severity="secondary" 
        text
      >
        Tutup
      </Button>
    </template>
  </Dialog>
</template>

<style scoped></style>
