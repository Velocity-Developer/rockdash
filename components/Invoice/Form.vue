
<template>
  <form @submit.prevent="submitForm" class="p-4 space-y-5">
    <!-- Client Information -->
    <div>
      <div class="flex items-center gap-2 text-md font-bold mb-3">
        <Icon name="lucide:user-round" class="text-indigo-700" /> 
        Informasi Klien
        <!-- Badge untuk customer yang sudah ada -->
        <div v-if="form.customer_id" class="flex items-center gap-1">
          <Badge value="Customer Terdaftar" severity="success" class="text-xs" />
          <Button 
            @click="clearSelectedCustomer" 
            icon="lucide:x" 
            size="small" 
            severity="secondary" 
            text 
            class="p-1 w-6 h-6" 
            v-tooltip="'Hapus pilihan customer'"
          />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div class="relative">
          <label class="block text-sm font-medium mb-1">Nama</label>
          <div class="relative">
            <InputText v-model="form.nama_klien" class="w-full" :class="{ 'p-invalid': errorSubmit.nama_klien }" placeholder="Masukkan nama klien" />
          </div>
          
          <!-- Customer Suggestions Dropdown -->
          <div v-if="showCustomerPicker" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-600">
            <div v-if="isSearchingCustomer" class="p-3 text-sm text-gray-500 dark:text-gray-400">
              <Icon name="lucide:loader-2" class="animate-spin inline mr-2" />Mencari...
            </div>
            <div v-else-if="customerOptions.length">
              <div 
                v-for="customer in customerOptions" 
                :key="customer.id"
                @click="selectCustomer(customer)"
                class="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div class="font-medium text-sm">{{ customer.raw.nama }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  <span v-if="customer.raw.email">{{ customer.raw.email }}</span>
                  <span v-if="customer.raw.email && customer.raw.hp"> • </span>
                  <span v-if="customer.raw.hp">{{ customer.raw.hp }}</span>
                  <span v-if="customer.raw.alamat"> • {{ customer.raw.alamat }}</span>
                </div>
              </div>
            </div>
            <div v-else class="p-3 text-sm text-gray-500 dark:text-gray-400">
              Tidak ditemukan customer. Customer baru akan dibuat.
            </div>
          </div>
          
          <small v-if="errorSubmit.nama_klien" class="text-red-500 block mt-1">{{ errorSubmit.nama_klien[0] }}</small>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Telepon</label>
          <InputText v-model="form.telepon_klien" class="w-full" :class="{ 'p-invalid': errorSubmit.telepon_klien }" placeholder="No hp klien" />
          <small v-if="errorSubmit.telepon_klien" class="text-red-500 block mt-1">{{ errorSubmit.telepon_klien[0] }}</small>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <InputText v-model="form.email_klien" type="email" class="w-full" :class="{ 'p-invalid': errorSubmit.email_klien }" placeholder="Email klien" />
          <small v-if="errorSubmit.email_klien" class="text-red-500 block mt-1">{{ errorSubmit.email_klien[0] }}</small>
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
          <DatePicker
           v-model="form.tanggal" 
           showTime
           hourFormat="24"
           dateFormat="dd-mm-yy"
           class="w-full" :class="{ 'p-invalid': errorSubmit.tanggal }"
          />
          <small v-if="errorSubmit.tanggal" class="text-red-500 block mt-1">{{ errorSubmit.tanggal[0] }}</small>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Jatuh tempo</label>
          <DatePicker v-model="form.jatuh_tempo" dateFormat="dd/mm/yy" class="w-full" :class="{ 'p-invalid': errorSubmit.jatuh_tempo }" />
          <small v-if="errorSubmit.jatuh_tempo" class="text-red-500 block mt-1">{{ errorSubmit.jatuh_tempo[0] }}</small>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <div>
          <label class="block text-sm font-medium mb-1">Unit</label>
          <Select v-model="form.unit" :options="unitOptions" optionLabel="label" optionValue="value" class="w-full" :class="{ 'p-invalid': errorSubmit.unit }" placeholder="Pilih unit" />
          <small v-if="errorSubmit.unit" class="text-red-500 block mt-1">{{ errorSubmit.unit[0] }}</small>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <Select v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" class="w-full" :class="{ 'p-invalid': errorSubmit.status }" placeholder="Pilih status" />
          <small v-if="errorSubmit.status" class="text-red-500 block mt-1">{{ errorSubmit.status[0] }}</small>
        </div>
        <div v-if="form.status === 'lunas'">
          <label class="block text-sm font-medium mb-1">Tanggal bayar</label>
          <DatePicker
            v-model="form.tanggal_bayar"
            showTime
            hourFormat="24"
            class="w-full" 
            dateFormat="dd-mm-yy"
            :class="{ 'p-invalid': errorSubmit.tanggal_bayar }" 
          />
          <small v-if="errorSubmit.tanggal_bayar" class="text-red-500 block mt-1">{{ errorSubmit.tanggal_bayar[0] }}</small>
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
            <div class="md:col-span-4">
              <label class="block text-xs font-medium mb-1">
                Jenis                
                <span v-if="item.webhost_id && item.website" class="opacity-75">
                  ( {{ item.website }} )
                </span>
              </label>
              <div class="flex gap-2">
                <Select v-model="item.jenis" :options="dataOpsiJenis" showClear class="w-full" :class="{ 'p-invalid': errorSubmit[`items.${index}.jenis`] }" placeholder="Jenis layanan" />
                <Button 
                  v-if="item.jenis" 
                  @click="openWebhostDialog(index)"
                  type="button" 
                  severity="info" outlined
                  size="small"
                  v-tooltip="'Pilih Webhost'"
                >
                  <Icon name="lucide:globe" />
                </Button>
              </div>
              <small v-if="errorSubmit[`items.${index}.jenis`]" class="text-red-500 block mt-1">{{ errorSubmit[`items.${index}.jenis`][0] }}</small>
            </div>
            <div class="md:col-span-5">
              <label class="block text-xs font-medium mb-1">Nama Item</label>
              <InputText v-model="item.nama" class="w-full" :class="{ 'p-invalid': errorSubmit[`items.${index}.nama`] }" placeholder="Nama/keterangan" />
              <small v-if="errorSubmit[`items.${index}.nama`]" class="text-red-500 block mt-1">{{ errorSubmit[`items.${index}.nama`][0] }}</small>
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-medium mb-1">Harga</label>
              <InputNumber v-model="item.harga" class="w-full" :class="{ 'p-invalid': errorSubmit[`items.${index}.harga`] }" placeholder="0.00" mode="currency" currency="IDR" locale="id-ID" />
              <small v-if="errorSubmit[`items.${index}.harga`]" class="text-red-500 block mt-1">{{ errorSubmit[`items.${index}.harga`][0] }}</small>
            </div>
            <div class="md:col-span-1 md:justify-self-end">
              <Button @click="removeItem(index)" type="button" severity="danger" class="px-1" text :disabled="form.items.length === 1">
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
            <ToggleSwitch v-model="form.pajak" :class="{ 'p-invalid': errorSubmit.pajak }" />
          </div>
          <template v-if="form.pajak">
            <div class="font-semibold">Nama Pajak:</div>
            <div class="text-right">
              <InputText
                v-model="form.nama_pajak"
                class="w-full text-right"
                :class="{ 'p-invalid': errorSubmit.nama_pajak }"
                placeholder="PPN, PPh, dll"
                size="small"
              />
            </div>
            <div class="font-semibold">Nominal Pajak:</div>
            <div class="text-right">
              <InputNumber
                v-model="form.nominal_pajak"
                class="overflow-hidden rounded-md border-none"
                fluid
                mode="currency"
                currency="IDR"
                locale="id-ID"
                :class="{ 'p-invalid': errorSubmit.nominal_pajak }"
                size="small"
                placeholder="0"
              />
            </div>
          </template>
          <div class="col-span-2 border border-b-blue-300"></div>
          <div class="font-semibold">Total:</div>
          <div class="text-right font-semibold text-xl">{{ formatIDR(form.total) }}</div>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium mb-1">Notes (Optional)</label>
      <Textarea v-model="form.note" class="w-full" :class="{ 'p-invalid': errorSubmit.note }" placeholder="Tambahkan catatan tambahan" rows="3" />
      <small v-if="errorSubmit.note" class="text-red-500 block mt-1">{{ errorSubmit.note[0] }}</small>
    </div>

    <!-- Error Display -->
    <Message v-if="Object.keys(errorSubmit).length > 0" severity="error" closable>
      <h4 class="text-red-800 font-medium mb-2">Terdapat kesalahan pada form:</h4>
      <ul class="text-red-700 text-sm space-y-1">
        <li v-for="(errors, field) in errorSubmit" :key="field" class="flex items-start">
          <span class="inline-block w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
          <div>
            <span class="font-medium capitalize">{{ String(field).replace('_', ' ') }}:</span>
            <span v-if="Array.isArray(errors)">{{ errors.join(', ') }}</span>
            <span v-else>{{ errors }}</span>
          </div>
        </li>
      </ul>
    </Message>

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

  <!-- Webhost Picker Dialog -->
  <Dialog 
    v-model:visible="showWebhostPickerDialog" 
    modal 
    header="Pilih Webhost" 
    :style="{ width: '60rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <div class="mb-4">
      <InputText 
        v-model="webhostPickerSearch" 
        placeholder="Cari webhost berdasarkan nama atau domain..." 
        class="w-full"
      />
    </div>
    
    <div v-if="isLoadingWebhostPicker" class="text-center py-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <div class="mt-2">Mencari webhost...</div>
    </div>
    <div v-else-if="webhostPickerResults.length" class="max-h-96 overflow-y-auto space-y-2">
      <div 
        v-for="webhost in webhostPickerResults" 
        :key="webhost.id"
        @click="selectWebhostFromPicker(webhost)"
        class="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {{ webhost.nama }}
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500">
      <i class="pi pi-search text-4xl mb-2 block"></i>
      <div>{{ webhostPickerSearch ? 'Tidak ada webhost ditemukan' : 'Ketik untuk mencari webhost' }}</div>
    </div>
    
    <template #footer>
      <Button @click="showWebhostPickerDialog = false" label="Tutup" severity="secondary" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
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
  pajak: false as boolean,
  nama_pajak: '' as string,
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

// Webhost picker dialog state
const showWebhostPickerDialog = ref(false);
const webhostPickerResults = ref<any[]>([]);
const isLoadingWebhostPicker = ref(false);
const webhostPickerSearch = ref('');
const currentWebhostItemIndex = ref<number | null>(null);

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
    const res: any = await client('/api/webhost_search/'+websiteName.trim());
    const items = res?.data ?? res?.data?.data ?? res?.data ?? res?.items ?? res;
    const list = Array.isArray(items?.data) ? items.data : (Array.isArray(items) ? items : []);
    
    webhostSearchResults.value = list.map((w: any) => ({
      id: w.id_webhost,
      nama: w.nama_web,
      label: `${w.nama_web}`,
      value: w.id_webhost,
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

// Open webhost picker dialog
function openWebhostDialog(itemIndex: number) {
  currentWebhostItemIndex.value = itemIndex;
  webhostPickerSearch.value = '';
  webhostPickerResults.value = [];
  showWebhostPickerDialog.value = true;
  // Load initial webhost data
  searchWebhostPicker('');
}

// Search webhost for picker dialog
async function searchWebhostPicker(query: string) {
  try {
    isLoadingWebhostPicker.value = true;
    const res: any = await client('/api/webhost_search/'+query.trim());
    const items = res?.data ?? res?.data?.data ?? res?.data ?? res?.items ?? res;
    const list = Array.isArray(items?.data) ? items.data : (Array.isArray(items) ? items : []);
    
    webhostPickerResults.value = list.map((w: any) => ({
      id: w.id_webhost,
      nama: w.nama_web,
      label: `${w.nama_web}`,
      value: w.id_webhost,
      raw: w,
    }));
  } catch (e) {
    console.error('Error searching webhost:', e);
    webhostPickerResults.value = [];
  } finally {
    isLoadingWebhostPicker.value = false;
  }
}

// Select webhost from picker dialog
function selectWebhostFromPicker(webhost: any) {
  if (currentWebhostItemIndex.value !== null) {
    const item = form.items[currentWebhostItemIndex.value];
    item.webhost_id = webhost.id;
    item.website = webhost.nama;
  }
  showWebhostPickerDialog.value = false;
  currentWebhostItemIndex.value = null;
}

// Cari customer dari backend berdasarkan nama
async function searchCustomers() {
  const hasName = !!form.nama_klien && String(form.nama_klien).trim().length > 1;
  
  // Tampilkan picker jika ada nama klien (minimal 2 karakter)
  if (!hasName) {
    showCustomerPicker.value = false;
    customerOptions.value = [];
    return;
  }
  
  try {
    isSearchingCustomer.value = true;
    showCustomerPicker.value = true;
    
    // Pencarian berdasarkan nama klien
    const q = String(form.nama_klien).trim();
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

// Pilih customer dari suggestion
function selectCustomer(customer: any) {
  selectedCustomerId.value = customer.value;
  form.nama_klien = customer.raw.nama;
  showCustomerPicker.value = false;
}

// Hapus pilihan customer
function clearSelectedCustomer() {
  selectedCustomerId.value = null;
  form.customer_id = null;
}

// Tutup dropdown ketika klik di luar
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    showCustomerPicker.value = false;
  }
}

// Setup event listener untuk click outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  // Reset error submit saat form dibuka
  errorSubmit.value = {};
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Trigger search when nama_klien changes with debounce
watch(
  () => form.nama_klien,
  () => {
    if (customerSearchTimer) clearTimeout(customerSearchTimer);
    customerSearchTimer = setTimeout(searchCustomers, 400);
  }
)

// Watch selectedCustomerId to update form.customer_id
watch(selectedCustomerId, async (newValue) => {
  form.customer_id = newValue;
  
  // Jika memilih customer, isi field yang kosong dengan data customer
  if (newValue) {
    const selectedCustomer = customerOptions.value.find(c => c.value === newValue);
    if (selectedCustomer && selectedCustomer.raw) {
      const customer = selectedCustomer.raw;
      
      // Isi field yang kosong dengan data customer
      if (!form.nama_klien) form.nama_klien = customer.nama || '';
      if (!form.email_klien) form.email_klien = customer.email || '';
      if (!form.alamat_klien) form.alamat_klien = customer.alamat || '';
      if (!form.telepon_klien) form.telepon_klien = customer.hp || '';
    }
    
    // Jika edit mode, load data customer tersebut
    if (props.action === 'edit') {
      await loadCustomerData(newValue);
    }
  }
})

// Watch webhost picker search with debounce
let webhostPickerSearchTimer: any = null;
watch(webhostPickerSearch, (newValue) => {
  if (webhostPickerSearchTimer) clearTimeout(webhostPickerSearchTimer);
  webhostPickerSearchTimer = setTimeout(() => {
    searchWebhostPicker(newValue);
  }, 400);
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
    form.tanggal = props.modelValue.tanggal ? dayjs(props.modelValue.tanggal).toDate() : dayjs().toDate();
    form.jatuh_tempo = props.modelValue.jatuh_tempo;
    form.tanggal_bayar = props.modelValue.tanggal_bayar ? dayjs(props.modelValue.tanggal_bayar).toDate() : null;
    form.subtotal = Number(props.modelValue.subtotal || 0);
    form.pajak = Boolean(props.modelValue.pajak);
    form.nama_pajak = props.modelValue.nama_pajak || '';
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
    form.tanggal = dayjs().toDate();
    form.jatuh_tempo = null;
    form.tanggal_bayar = null;
    form.subtotal = 0;
    form.pajak = false;
    form.nama_pajak = '';
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

// Reset pajak fields when pajak is disabled
watch(
  () => form.pajak,
  (newValue) => {
    if (!newValue) {
      form.nama_pajak = '';
      form.nominal_pajak = 0;
    }
  }
)



// Derive total from subtotal and nominal_pajak
watch(
  () => [form.subtotal, form.nominal_pajak, form.pajak],
  () => {
    const sub = Number(form.subtotal || 0);
    const pajakNom = form.pajak ? Number(form.nominal_pajak || 0) : 0;
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
    
    // Validasi pajak
    if (form.pajak) {
      if (!form.nama_pajak) throw { bag: { nama_pajak: ['Nama pajak harus diisi'] } };
      if (!form.nominal_pajak && form.nominal_pajak !== 0) throw { bag: { nominal_pajak: ['Nominal pajak harus diisi'] } };
    }
    
    // Validasi tanggal_bayar untuk status lunas
    if (form.status === 'lunas' && !form.tanggal_bayar) {
      throw { bag: { tanggal_bayar: ['Tanggal bayar harus diisi untuk status lunas'] } };
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
    } else {
      // Update data customer yang sudah ada saat edit invoice
      console.log('DEBUG: customerId =', customerId);
      console.log('DEBUG: props.action =', props.action);
      console.log('DEBUG: selectedCustomerId =', selectedCustomerId.value);
      console.log('DEBUG: form.customer_id =', form.customer_id);

      if (props.action === 'edit') {
        console.log('DEBUG: Will update customer', customerId);
        try {
          const customerData = {
            nama: form.nama_klien,
            email: form.email_klien || null,
            hp: form.telepon_klien || null,
            alamat: form.alamat_klien || null,
          };
          console.log('DEBUG: Customer data to update:', customerData);

          await client(`/api/customer/${customerId}`, {
            method: 'PUT',
            body: customerData
          });
          console.log('DEBUG: Customer updated successfully');
        } catch (error) {
          console.error('Error updating customer:', error);
          // Tetap lanjutkan simpan invoice meskipun update customer gagal
        }
      } else {
        console.log('DEBUG: Not updating customer because action is not edit');
      }
    }

    // Kosongkan tanggal_bayar jika status bukan lunas
    if (form.status !== 'lunas') {
      form.tanggal_bayar = null;
    }
    
    // Format tanggal & bentuk payload invoice
    const formData: any = {
      unit: form.unit,
      customer_id: customerId,
      note: form.note,
      status: form.status,
      pajak: form.pajak,
      nama_pajak: form.nama_pajak || null,
      tanggal: form.tanggal ? dayjs(form.tanggal).format('YYYY-MM-DD HH:mm:ss') : null,
      jatuh_tempo: form.jatuh_tempo ? dayjs(form.jatuh_tempo).format('YYYY-MM-DD') : null,
      tanggal_bayar: form.tanggal_bayar ? dayjs(form.tanggal_bayar).format('YYYY-MM-DD HH:mm:ss') : null,
      subtotal: Number(form.subtotal || 0),
      nominal_pajak: Number(form.nominal_pajak || 0),
      total: Number(form.total || 0),
      items: form.items.map((it: any) => ({ id: it.id, webhost_id: it.webhost_id, nama: it.nama, jenis: it.jenis, harga: Number(it.harga || 0) })),
      customer_info : {
        nama: form.nama_klien,
        email: form.email_klien || null,
        hp: form.telepon_klien || null,
        alamat: form.alamat_klien || null,
      }
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
    
    // Reset error submit
    errorSubmit.value = {};
    
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

    console.log('error-submit',error)

    // const er = useSanctumError(error);
    errorSubmit.value = (error as any).bag || {};
        
    toast.add({
      severity: 'error',
      summary: 'Gagal!',
      detail: 'Terjadi kesalahan saat menyimpan data',
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


<style scoped></style>
