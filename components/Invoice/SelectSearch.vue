<template>
  <div>

    <div v-if="loading" class="border p-4 rounded opacity-50 animate-pulse">
      Mencari invoice terkait..
    </div>

    <div v-else-if="!loading && dataInvoices && dataInvoices?.data" class="bg-indigo-50 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-700 p-4 rounded">
      <div v-if="dataInvoices?.data" class="text-sm font-bold text-indigo-800 dark:text-indigo-200 flex items-center gap-1">
        <Icon name="lucide:receipt-text" />
        {{ dataInvoices.data.length }} Invoice ditemukan
      </div>

      <ul v-if="dataInvoices?.data" class="list-disc ps-4 text-xs mt-2">
        <li v-for="item in dataInvoices.data" :key="item.id">
          <div class="flex justify-between items-center pb-1">
            <div class="flex items-center gap-2">
              <input
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
      <div v-if="selectedInvoice && selectedInvoice?.nomor" class="mt-3 p-2 bg-green-100 dark:bg-green-900 rounded border border-green-300 dark:border-green-700">
        <div class="text-sm font-medium text-green-800 dark:text-green-200">
          <Icon name="lucide:check-circle" class="inline mr-1" />
          Terpilih: {{ selectedInvoice.nomor }} - {{ selectedInvoice.customer?.nama }}
        </div>
      </div>
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

const dataInvoices = ref({} as any);

// Preview dialog state
const visibleDialogPreview = ref(false);
const previewId = ref<number | null>(null);

function openPreview(id: number) {
  previewId.value = id;
  visibleDialogPreview.value = true;
}

// Fungsi untuk memilih invoice
function selectInvoice(invoice: any) {
  selectedInvoice.value = invoice;

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
  try {
    const data = await client('/api/invoice', {
      params: {
        status: 'belum',
        search_nama_web: props.search.nama_web,
        search_hp: props.search.hp,
      }
    }) as any
    dataInvoices.value = data;

    //jika ada invoice, pilih invoice pertama
    if (data.data.length > 0) {
      selectInvoice(data.data[0]);
    } else {
      selectedInvoice.value = {};
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
    getInvoices();
  } else {
    dataInvoices.value = {};
  }
});
</script>
