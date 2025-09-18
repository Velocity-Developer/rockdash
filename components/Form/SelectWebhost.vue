<template>
  <div>
    <!-- Button untuk membuka dialog -->
    <Button 
      @click="showDialog = true" 
      variant="outlined" 
      class="w-full !justify-start bg-white dark:bg-gray-950"
      :class="{ '!text-gray-400': !selectedWebhost }"
    >
      <span v-if="selectedWebhost">{{ selectedWebhost.nama_web }}</span>
      <span v-else>Pilih Webhost...</span>
      <Icon name="lucide:chevron-down" class="ml-auto" />
    </Button>

    <!-- Dialog untuk pencarian -->
    <Dialog 
      v-model:visible="showDialog" 
      modal 
      header="Pilih Webhost" 
      :style="{ width: '40rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div class="p-4">
        <!-- Form pencarian -->
        <form @submit.prevent="handleSubmit" class="flex mb-4">
          <InputText 
            v-model="form.search" 
            id="search" 
            type="text" 
            class="w-full" 
            placeholder="Ketik nama web.." 
            required
          />
          <div class="text-end">
            <Button type="submit" class="!py-3">
              <Icon v-if="isLoading" name="lucide:loader-circle" class="animate-spin"/>
              <Icon v-else name="lucide:search" />
            </Button>
          </div>
        </form>

        <!-- Hasil pencarian -->
        <div v-if="results && results.length > 0" class="max-h-96 overflow-y-auto">
          <div 
            v-for="item in results" 
            :key="item.id_webhost"
            class="border-b group border-zinc-100 dark:border-zinc-700"
          >
            <Button 
              @click="selectWebhost(item)"
              variant="text" 
              severity="secondary" 
              class="!text-zinc-700 dark:!text-zinc-100 w-full !justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {{ item.nama_web }}
              <Icon name="lucide:check" class="opacity-25 group-hover:opacity-100 duration-300 ease-in-out"/>
            </Button>
          </div>
        </div>

        <!-- Pesan jika tidak ada hasil -->
        <div v-else-if="form.search && !isLoading" class="text-center py-8 text-gray-500">
          <Icon name="lucide:search-x" class="text-4xl mb-2" />
          <p>Tidak ada webhost yang ditemukan</p>
        </div>

        <!-- Pesan awal -->
        <div v-else-if="!form.search" class="text-center py-8 text-gray-500">
          <Icon name="lucide:search" class="text-4xl mb-2" />
          <p>Ketik minimal 3 karakter untuk mencari webhost</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button 
            v-if="selectedWebhost" 
            @click="clearSelection" 
            variant="outlined" 
            severity="secondary"
          >
            Clear
          </Button>
          <Button @click="showDialog = false" variant="outlined">
            Batal
          </Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
interface Webhost {
  id_webhost: string | number;
  nama_web: string;
}

interface Props {
  modelValue?: string | number | null;
  placeholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string | number | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pilih Webhost...'
});

const emit = defineEmits<Emits>();

const client = useSanctumClient();
const toast = useToast();

// State
const showDialog = ref(false);
const isLoading = ref(false);
const selectedWebhost = ref<Webhost | null>(null);
const results = ref<Webhost[]>([]);

const form = reactive({
  search: '',
});

// Function untuk mengambil data webhost berdasarkan ID
const fetchWebhostById = async (id: string | number) => {
  try {
    const response = await client(`/api/webhost/${id}`) as Webhost;
    return response;
  } catch (error) {
    console.error('Error fetching webhost:', error);
    return null;
  }
};

// Watch untuk sinkronisasi dengan v-model
watch(() => props.modelValue, async (newValue) => {
  if (!newValue) {
    selectedWebhost.value = null;
    return;
  }

  // Jika ada ID, ambil data webhost lengkap untuk ditampilkan
  const webhostData = await fetchWebhostById(newValue);
  if (webhostData) {
    selectedWebhost.value = webhostData;
  }
}, { immediate: true });

// Watch untuk emit perubahan - hanya kirim ID
watch(selectedWebhost, (newValue) => {
  if (newValue) {
    emit('update:modelValue', newValue.id_webhost);
  } else {
    emit('update:modelValue', null);
  }
});

// Methods
const handleSubmit = async () => {
  isLoading.value = true;

  // Validasi input
  if (!form.search || form.search.length < 3) {
    toast.add({
      severity: 'warn',
      summary: 'Kesalahan!',
      detail: 'Pencarian harus lebih dari minimal 3 karakter',
      life: 3000
    });
    isLoading.value = false;
    return;
  }

  try {
    const response = await client(`/api/webhost_search/${form.search}`) as Webhost[];
    results.value = response;
  } catch (error: any) {
    toast.add({
      severity: 'warn',
      summary: 'Tidak ditemukan!',
      detail: error?.data?.message || 'Terjadi kesalahan saat mencari webhost',
      life: 3000
    });
    results.value = [];
  }

  isLoading.value = false;
};

const selectWebhost = (webhost: Webhost) => {
  selectedWebhost.value = webhost;
  showDialog.value = false;
  form.search = '';
  results.value = [];
  
  toast.add({
    severity: 'success',
    summary: 'Berhasil!',
    detail: `Webhost "${webhost.nama_web}" telah dipilih`,
    life: 2000
  });
};

const clearSelection = () => {
  selectedWebhost.value = null;
  showDialog.value = false;
  form.search = '';
  results.value = [];
};

// Reset form ketika dialog ditutup
watch(showDialog, (isOpen) => {
  if (!isOpen) {
    form.search = '';
    results.value = [];
  }
});
</script>