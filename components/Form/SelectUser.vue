<template>
  <div>
    <!-- Button untuk membuka dialog -->
    <Button 
      @click="showDialog = true" 
      variant="outlined" 
      class="w-full !justify-start"
      :class="{ '!text-gray-400': !selectedUser }"
    >
      <span v-if="selectedUser">{{ selectedUser.name }} ({{ selectedUser.username }})</span>
      <span v-else>Pilih User...</span>
      <Icon name="lucide:chevron-down" class="ml-auto" />
    </Button>

    <!-- Dialog untuk pencarian -->
    <Dialog 
      v-model:visible="showDialog" 
      modal 
      header="Pilih User" 
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
            placeholder="Ketik nama atau username.." 
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
              @click="selectUser(item)"
              variant="text" 
              severity="secondary" 
              class="!text-zinc-700 dark:!text-zinc-100 w-full !justify-between hover:bg-gray-50 dark:hover:bg-gray-800 !p-4"
            >
              <div class="text-left">
                <div class="font-semibold">{{ item.name }}</div>
                <div class="text-sm text-gray-500">@{{ item.username }} • {{ item.email }}</div>
                <div class="text-xs text-gray-400">{{ item.status }}</div>
              </div>
              <Icon name="lucide:check" class="opacity-25 group-hover:opacity-100 duration-300 ease-in-out"/>
            </Button>
          </div>
        </div>

        <!-- Pesan jika tidak ada hasil -->
        <div v-else-if="form.search && !isLoading" class="text-center py-8 text-gray-500">
          <Icon name="lucide:search-x" class="text-4xl mb-2" />
          <p>Tidak ada user yang ditemukan</p>
        </div>

        <!-- Pesan awal -->
        <div v-else-if="!form.search" class="text-center py-8 text-gray-500">
          <Icon name="lucide:search" class="text-4xl mb-2" />
          <p>Ketik minimal 3 karakter untuk mencari user</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button 
            v-if="selectedUser" 
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
interface User {
  id: string | number;
  name: string;
  username: string;
  email: string;
  status: string;
  hp?: string;
  alamat?: string;
}

interface Props {
  modelValue?: string | number | null;
  placeholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string | number | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pilih User...'
});

const emit = defineEmits<Emits>();

const client = useSanctumClient();
const toast = useToast();

// State
const showDialog = ref(false);
const isLoading = ref(false);
const selectedUser = ref<User | null>(null);
const results = ref<User[]>([]);

const form = reactive({
  search: '',
});

// Function untuk mengambil data user berdasarkan ID
const fetchUserById = async (id: string | number) => {
  try {
    const response = await client(`/api/users/${id}`) as User;
    return response;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Watch untuk sinkronisasi dengan v-model
watch(() => props.modelValue, async (newValue) => {
  if (!newValue) {
    selectedUser.value = null;
    return;
  }

  // Jika ada ID, ambil data user lengkap untuk ditampilkan
  const userData = await fetchUserById(newValue);
  if (userData) {
    selectedUser.value = userData;
  }
}, { immediate: true });

// Watch untuk emit perubahan - hanya kirim ID
watch(selectedUser, (newValue) => {
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
    const response = await client(`/api/user_search/${form.search}`) as User[];
    results.value = response;
  } catch (error: any) {
    toast.add({
      severity: 'warn',
      summary: 'Tidak ditemukan!',
      detail: error?.data?.message || 'Terjadi kesalahan saat mencari user',
      life: 3000
    });
    results.value = [];
  }

  isLoading.value = false;
};

const selectUser = (user: User) => {
  selectedUser.value = user;
  showDialog.value = false;
  form.search = '';
  results.value = [];
  
  toast.add({
    severity: 'success',
    summary: 'Berhasil!',
    detail: `User "${user.name}" telah dipilih`,
    life: 2000
  });
};

const clearSelection = () => {
  selectedUser.value = null;
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