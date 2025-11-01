<template>

  <div class="bg-indigo-50 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-700 p-4 rounded">
        
    <div class="text-sm font-bold text-indigo-800 dark:text-indigo-200 flex items-center gap-1">
      <Icon name="lucide:receipt-text" />
      Invoice {{ dataInvoices.data?.length ?? '0' }}  ditemukan
    </div>

    <div v-if="loading" class="text-sm opacity-50 animate-pulse">
      Mencari invoice terkait..
    </div>
    
    <div v-if="dataInvoices.data?.length == 0">      
      <div class="flex gap-2 mt-1">
        <InputText
          v-model="searchInvoiceNumber"
          placeholder="Masukkan nomor invoice..."
          class="flex-1"
          size="small"
        />
        <Button
          @click="getInvoices"
          :disabled="!searchInvoiceNumber || loadingSearch"
          :loading="loadingSearch"
          size="small"
          severity="contrast"
        >
          <Icon name="lucide:search" />
        </Button>
      </div>
    </div>  
    
    <ul v-if="dataInvoices.data?.length > 0" class="text-xs mt-2">
      <li v-for="item in dataInvoices.data" :key="item.id">
        <div class="flex justify-between items-center py-1 border-b border-slate-300 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <RadioButton
              type="radio"
              :name="'invoice-select'"
              :value="item.id"
              v-model="selectedInvoiceId"
              @change="selectInvoice(item)"
              class="cursor-pointer"
            />
            <span
              @click="openPreview(item.id)"
              class="hover:underline cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {{ item.nomor }} | {{ item.customer.nama }} | {{ item.tanggal }}
            </span>
          </div>
          <Badge
            :severity="item.status === 'belum' ? 'contrast' : 'success'"
            size="small"
            class="font-normal capitalize"
          >
            {{ item.status }}
          </Badge>
        </div>
      </li>
    </ul> 
    
    <!-- Selected invoice info -->
    <div v-if="selectedInvoice && selectedInvoice?.nomor" class="flex justify-between items-center mt-3 p-2 bg-green-100 dark:bg-green-900 rounded border border-green-300 dark:border-green-700">
      <div class="text-sm font-medium text-green-800 dark:text-green-200">
        <Icon name="lucide:check-circle" class="inline mr-1" />
        Terpilih: {{ selectedInvoice.nomor }} - {{ selectedInvoice.customer?.nama }}
      </div>
      <Button size="small" severity="danger" @click="resetSelectedInvoice">
        <Icon name="lucide:trash-2"/>
      </Button>
    </div>

  </div>

  <!-- Dialog Preview Invoice -->
  <Dialog v-model:visible="visibleDialogPreview" modal header="Preview Invoice" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <InvoicePreview
      v-if="previewId"
      :id="previewId"
    />
  </Dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  search: {
    type: Object,
    default: {}
  }
})

// Define emit untuk memberikan notifikasi ke parent
const emit = defineEmits(['invoice-selected'])

const client = useSanctumClient();
const loading = ref(false);
const selectedInvoice = ref({} as any);
const selectedInvoiceId = ref<number | null>(null);

const dataInvoices = ref({
  data: [] as any[],
} as any);

// Preview dialog state
const visibleDialogPreview = ref(false);
const previewId = ref<number | null>(null);

// Search by invoice number state
const searchInvoiceNumber = ref('');
const loadingSearch = ref(false);
const searchResults = ref<any[] | null>(null);

function openPreview(id: number) {
  previewId.value = id;
  visibleDialogPreview.value = true;
}


// Fungsi untuk memilih invoice
function selectInvoice(invoice: any) {
  selectedInvoice.value = invoice;

  //ubah format hp menjadi 081234567890, dan hapus spasi dan strip non-digit
  if (invoice.customer.hp) {
    invoice.customer.hp = invoice.customer.hp.replace(/^0/, '628').replace(/\D/g, '');
  }

  // Emit data ke parent component
  emit('invoice-selected', {
    id: invoice.id,
    customer_id: invoice.customer.id,
    customer_hp: invoice.customer.hp,
    customer_email: invoice.customer.email,
    customer_nama: invoice.customer.nama,
    total_invoice: invoice.total,
    jenis_project: invoice.items.map((item: any) => item.jenis),
  });
}
const getInvoices = async () => {
  loading.value = true;

  // ambil nomor hp, hanya ambil yang pertama jika ada koma
  let hp = props.search.hp;
  if (hp && hp.includes(',')) {
    hp = hp.split(',')[0].trim();
  }

  try {
    const data = await client('/api/invoice', {
      params: {
        status: 'belum',
        search_nama_web: props.search.nama_web,
        search_hp: hp,
        search_nomor: searchInvoiceNumber.value.trim(),
      }
    }) as any
    dataInvoices.value = data;

    //jika tidak ada invoice, reset selectedInvoice
    if (data.data.length == 0) {
      selectedInvoice.value = {};
      selectedInvoiceId.value = null;
    }
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}

//jika ada perubahan di props.search dan tidak kosong, maka panggil getInvoices
watch(() => props.search, (newVal) => {
  if (newVal.nama_web || newVal.hp) {
    //reset searchInvoiceNumber
    searchInvoiceNumber.value = '';
    getInvoices();
  } else {
    dataInvoices.value = {
      data: [] as any[],
    };
  }
});

// Fungsi untuk reset selected invoice
function resetSelectedInvoice() {
  selectedInvoice.value = {};
  selectedInvoiceId.value = null;

  //reset emit
  emit('invoice-selected', {
    id: null,
    customer_id: null,
    customer_hp: null,
    customer_email: null,
    customer_nama: null,
    total_invoice: null,
    jenis_project: null,
  });
}
</script>
