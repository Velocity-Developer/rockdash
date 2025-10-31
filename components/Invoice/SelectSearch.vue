<template>
  <div>

    <div v-if="loading" class="border p-4 rounded opacity-50 animate-pulse">
      Mencari invoice terkait..
    </div>

    <div v-else-if="!loading && dataInvoices && dataInvoices?.data" class="bg-indigo-50 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-700 p-4 rounded">
      <div v-if="dataInvoices?.data" class="mb-2 text-sm font-bold text-indigo-800 dark:text-indigo-200 flex items-center gap-1">
        <Icon name="lucide:receipt-text" />
        {{ dataInvoices.data.length }} Invoice ditemukan
      </div>

      <ul class="list-disc ps-4 text-xs">
        <li v-for="item in dataInvoices.data" :key="item.id">
          <div class="flex justify-between pb-1">
            <span
              @click="openPreview(item.id)"
              class="hover:underline cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {{ item.nomor }} | {{ item.customer.nama }} | {{ item.tanggal }}
            </span>
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
const client = useSanctumClient();
const loading = ref(false);
const selectedInvoice = ref('');

const dataInvoices = ref({} as any);

// Preview dialog state
const visibleDialogPreview = ref(false);
const previewId = ref<number | null>(null);

function openPreview(id: number) {
  previewId.value = id;
  visibleDialogPreview.value = true;
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
