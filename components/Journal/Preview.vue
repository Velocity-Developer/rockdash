<template>

  <div class="mb-6 rounded-md p-5 bg-sky-100 dark:bg-sky-950">
    <div class="grid grid-cols-6 gap-2">
      <div class="col-span-6 md:col-span-3">
         <div class="flex items-center gap-3">
          <div class="w-10 h-10 md:w-15 md:h-15 text-xl p-2 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg">
            {{ journal.journal_category?.icon }}
          </div>
          <div>
            <h3 v-if="journal.role != 'support'" class="font-semibold">
              {{ journal.title }}
            </h3>
            <div v-else class="text-sm opacity-50">Kategori</div>
            <p>                        
                {{ journal.journal_category?.name }}
            </p>
          </div>
        </div>
      </div>
      <div class="col-span-6 md:col-span-3">        
          <div class="flex items-center gap-3">          
            <Avatar 
              :image="journal.user?.avatar_url" 
              shape="circle" 
              size="medium"
              class="border-2 border-gray-200"
              />
            <div>
              <div class="text-sm opacity-50">Oleh</div>
              <div class="font-medium">
                {{ journal.user?.name }}                
                <Badge class="ml-1 capitalize" v-if="journal.user?.user_roles" severity="contrast">
                    {{ journal.user.user_roles[0] }}
                </Badge>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>

  <!-- Info Klien -->
  
  <div
    v-if="journal.webhost || journal.detail_support"
    class="mb-6 rounded-md p-5 bg-indigo-100 dark:bg-indigo-950">
    <div class="font-medium mb-4 flex items-center gap-1">
      <Icon name="lucide:square-user" /> Info Klien
    </div>    
    <div class="grid grid-cols-6 gap-3 md:gap-5">
      <div class="col-span-6 md:col-span-3 flex items-center gap-3">
        <div class="w-10 h-10 p-2 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg">
          <Icon name="lucide:globe" class="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <div class="text-sm opacity-50">Web</div>
          <div class="font-medium">
            {{ journal.webhost?.nama_web }}
            <Badge v-if="journal.cs_main_project" size="small" class="bg-green-100 text-green-700">
            {{ journal.cs_main_project.jenis }}
            </Badge>
          </div>
        </div>
      </div>
      <div v-if="isDetailSupport || props.journal.detail_support?.hp" class="col-span-6 md:col-span-3 flex items-center gap-3">
        <div class="w-10 h-10 p-2 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg">
          <Icon name="lucide:phone" class="text-sky-600 dark:text-indigo-400" />
        </div>
        <div>
          <div class="text-sm opacity-50">No.Hp</div>
          <div class="font-medium">
            {{ journal.detail_support?.hp }}
          </div>
        </div>
      </div>
      <div v-if="isDetailSupport" class="col-span-6 md:col-span-3 flex items-center gap-3">
        <div class="w-10 h-10 p-2 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg">
          <Icon name="lucide:mail" class="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <div class="text-sm opacity-50">Email</div>
          <div class="font-medium">
            {{ journal.detail_support?.email }}
          </div>
        </div>
      </div>
      <div v-if="isDetailSupport" class="col-span-6 md:col-span-3 flex items-center gap-3">
        <div class="w-10 h-10 p-2 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg">
          <Icon name="lucide:message-circle" class="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <div class="text-sm opacity-50">WhatsApp</div>
          <div class="font-medium">
            {{ journal.detail_support?.wa }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="space-y-6">
    
    <!-- Time Info -->
    <div class="mb-6 border rounded-md p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 p-2 flex items-center justify-center bg-blue-100 dark:bg-blue-500 rounded-lg">
            <Icon name="lucide:play" class="text-blue-600 dark:text-white" />
          </div>
          <div>
            <div class="text-sm opacity-50">Mulai</div>
            <div class="text-sm">
              {{ formatDate(journal.start, 'DD MMM YYYY HH:mm') }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-10 h-10 p-2 flex items-center justify-center bg-green-100 dark:bg-green-500 rounded-lg">
            <Icon name="lucide:check-circle" class="text-green-600 dark:text-white" />
          </div>
          <div>
            <div class="text-sm opacity-50">Selesai</div>
            <div class="text-sm">
              {{ journal.end ? formatDate(journal.end, 'DD MMM YYYY HH:mm') : '-' }}
            </div>
          </div>
        </div>

        <div class="col-span-2 md:col-span-1 flex items-center gap-3">
          <div class="w-10 h-10 p-2 flex items-center justify-center bg-amber-100 dark:bg-amber-500 rounded-lg">
            <Icon name="lucide:clock" class="text-amber-600 dark:text-white" />
          </div>
          <div>
            <div class="text-sm opacity-50">Durasi</div>
            <div class="text-sm">
              {{ journal.start && journal.end?calculateDuration(journal.start, journal.end):'-' }}
            </div>
          </div>
        </div>
    </div>

    <!-- Description -->
    <div class="mb-6 border rounded-md p-5" v-if="journal.description">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-10 h-10 p-2 flex items-center justify-center bg-zinc-100 dark:bg-zinc-500 rounded-lg">
              <Icon name="lucide:file-text" class="text-zinc-600 dark:text-white" />
            </div>
          <span class="font-medium">Deskripsi</span>
        </div>
        <div class="prose prose-sm max-w-none text-sm whitespace-pre-wrap" v-html="journal.description">
        </div>
    </div>

    <!-- Detail Support -->
    <div v-if="isDetailSupport && kategoriSelectedInfo && ['Konsultasi Update','Trouble'].includes(kategoriSelectedInfo.name)" class="col-span-6 mb-6 rounded-md p-5 bg-emerald-50 dark:bg-emerald-950">
        <div class="font-medium mb-4 flex items-center gap-1">
          <Icon name="lucide:wallet" /> Biaya Support
        </div> 
        <div class="grid grid-cols-2 gap-3">
          
          <div v-if="journal.detail_support?.biaya" class="flex items-center gap-3">
            <div class="w-8 h-8 p-1.5 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg">
              <Icon name="lucide:dollar-sign" class="text-yellow-600 dark:text-white text-sm" />
            </div>
            <div>
              <div class="text-xs opacity-50">Biaya</div>
              <div class="text-sm font-medium">{{ formatCurrency(journal.detail_support.biaya) }}</div>
            </div>
          </div>
          
          <div v-if="journal.detail_support?.tanggal_bayar" class="flex items-center gap-3">
            <div class="w-8 h-8 p-1.5 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg">
              <Icon name="lucide:calendar-check" class="text-indigo-600 dark:text-white text-sm" />
            </div>
            <div>
              <div class="text-xs opacity-50">Tanggal Bayar</div>
              <div class="text-sm font-medium">{{ formatDate(journal.detail_support.tanggal_bayar, 'DD MMM YYYY') }}</div>
            </div>
          </div>

        </div>
     </div>   

  </div>
</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'

interface Journal {
  id: string | number;
  title: string;
  description?: string;
  start: string;
  end?: string;
  status: string;
  role?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string | number;
    name: string;
    avatar_url?: string;
    user_roles?: string[];
  };
  journal_category?: {
    id: string | number;
    name: string;
    icon: string;
  };
  webhost?: {
    id_webhost: string | number;
    nama_web: string;
  };
  cs_main_project?: {
    id: string | number;
    jenis: string;
  };
  detail_support?: {
    id: string | number;
    journal_id: string | number;
    hp?: string;
    wa?: string;
    email?: string;
    biaya?: string | number;
    tanggal_bayar?: string;
  };
}

interface Props {
  journal: Journal;
}

const props = defineProps<Props>();

const dayjs = useDayjs();

// Function untuk format tanggal
const formatDate = (dateString: string, format: string = 'DD/MM/YYYY HH:mm') => {
  if (!dateString) return '';
  return dayjs(dateString).format(format);
};

// Function untuk menghitung durasi
const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return '';
  
  const startTime = dayjs(start);
  const endTime = dayjs(end);
  const duration = endTime.diff(startTime);
  
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  } else {
    return `${minutes} menit`;
  }
};

// Function untuk format currency
const formatCurrency = (amount: string | number) => {
  if (!amount) return '';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount);
};

const isDetailSupport = computed(() => {
  //jika journal.role = support maka true
  if(props.journal.role === 'support') {
    return true
  } else {
    return false
  }
})

const kategoriSelectedInfo = computed(() => {
  if(isDetailSupport.value) {
    return props.journal.journal_category
  } else {
    return {}
  }
}) as any

</script>