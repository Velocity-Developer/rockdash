<template>
  <div>
    <!-- Container untuk button utama dan tombol clear -->
    <div class="flex gap-2">
      <!-- Button untuk membuka dialog -->
      <Button 
        @click="showDialog = true" 
        variant="outlined" 
        class="flex-1 !justify-start"
        :class="{ '!text-gray-400': !selectedCsMainProject }"
      >
        <span v-if="selectedCsMainProject">{{ selectedCsMainProject.jenis }} - {{ selectedCsMainProject.webhost?.nama_web }}</span>
        <span v-else>Pilih Project...</span>
        <Icon name="lucide:chevron-down" class="ml-auto" />
      </Button>
      
      <!-- Tombol Clear -->
      <Button 
        v-if="selectedCsMainProject"
        @click="clearSelection"
        variant="outlined"
        severity="secondary"
        class="!px-3"
        v-tooltip.top="'Hapus pilihan'"
      >
        <Icon name="lucide:x" />
      </Button>
    </div>

    <!-- Dialog untuk pencarian -->
    <Dialog 
      v-model:visible="showDialog" 
      modal 
      header="Pilih Project" 
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
            placeholder="Ketik jenis project atau nama web.." 
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
            :key="item.id"
            class="border-b group border-zinc-100 dark:border-zinc-700"
          >
            <Button 
              @click="selectCsMainProject(item)"
              variant="text" 
              severity="secondary" 
              class="!text-zinc-700 dark:!text-zinc-100 w-full !justify-between hover:bg-gray-50 dark:hover:bg-gray-800 !p-4"
            >
              <div class="text-left">
                <div class="font-semibold">{{ item.jenis }}</div>
                <div class="text-sm text-gray-500">{{ item.webhost?.nama_web }}</div>
                <div class="text-xs text-gray-400">{{ formatDate(item.tgl_masuk) }} - {{ item.status }}</div>
              </div>
              <Icon name="lucide:check" class="opacity-25 group-hover:opacity-100 duration-300 ease-in-out"/>
            </Button>
          </div>
        </div>

        <!-- Pesan jika tidak ada hasil -->
        <div v-else-if="form.search && !isLoading" class="text-center py-8 text-gray-500">
          <Icon name="lucide:search-x" class="text-4xl mb-2" />
          <p>Tidak ada Project yang ditemukan</p>
        </div>

        <!-- Pesan awal -->
        <div v-else-if="!form.search && !webhostId" class="text-center py-8 text-gray-500">
          <Icon name="lucide:search" class="text-4xl mb-2" />
          <p>Ketik minimal 3 karakter untuk mencari Project</p>
        </div>

        <!-- Loading state untuk auto-load -->
        <div v-else-if="isLoading && webhostId" class="text-center py-8 text-gray-500">
          <Icon name="lucide:loader-circle" class="text-4xl mb-2 animate-spin" />
          <p>Memuat daftar project...</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button 
            v-if="selectedCsMainProject" 
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
interface CsMainProject {
  id: string | number;
  jenis: string;
  deskripsi: string;
  tgl_masuk: string;
  status: string;
  id_webhost: string | number;
  webhost?: {
    id_webhost: string | number;
    nama_web: string;
  };
}

interface Props {
  modelValue?: string | number | null;
  webhostId?: string | number | null;
  placeholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string | number | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pilih CS Main Project...'
});

const emit = defineEmits<Emits>();

const client = useSanctumClient();
const toast = useToast();

// State
const showDialog = ref(false);
const isLoading = ref(false);
const selectedCsMainProject = ref<CsMainProject | null>(null);
const results = ref<CsMainProject[]>([]);

const form = reactive({
  search: '',
});

// Function untuk mengambil data cs_main_project berdasarkan ID
const fetchCsMainProjectById = async (id: string | number) => {
  try {
    const response = await client(`/api/cs_main_project/${id}`) as CsMainProject;
    return response;
  } catch (error) {
    console.error('Error fetching cs_main_project:', error);
    return null;
  }
};

// Function untuk format tanggal
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID');
};

// Watch untuk sinkronisasi dengan v-model
watch(() => props.modelValue, async (newValue) => {
  if (!newValue) {
    selectedCsMainProject.value = null;
    return;
  }

  // Jika ada ID, ambil data cs_main_project lengkap untuk ditampilkan
  const csMainProjectData = await fetchCsMainProjectById(newValue);
  if (csMainProjectData) {
    selectedCsMainProject.value = csMainProjectData;
  }
}, { immediate: true });

// Watch untuk emit perubahan - hanya kirim ID
watch(selectedCsMainProject, (newValue) => {
  if (newValue) {
    emit('update:modelValue', newValue.id);
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
    let url = `/api/cs_main_project_search/${form.search}`;
    if (props.webhostId) {
      url += `?webhost_id=${props.webhostId}`;
    }
    
    const response = await client(url) as CsMainProject[];
    results.value = response;
  } catch (error: any) {
    toast.add({
      severity: 'warn',
      summary: 'Tidak ditemukan!',
      detail: error?.data?.message || 'Terjadi kesalahan saat mencari CS Main Project',
      life: 3000
    });
    results.value = [];
  }

  isLoading.value = false;
};

const selectCsMainProject = (csMainProject: CsMainProject) => {
  selectedCsMainProject.value = csMainProject;
  showDialog.value = false;
  form.search = '';
  results.value = [];
  
  toast.add({
    severity: 'success',
    summary: 'Berhasil!',
    detail: `CS Main Project "${csMainProject.jenis}" telah dipilih`,
    life: 2000
  });
};

const clearSelection = () => {
  selectedCsMainProject.value = null;
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
