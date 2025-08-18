<template>
  <div class="space-y-6">
    <!-- Header Info -->
    <Card>
        <template #content>
            <div class="flex flex-col md:flex-row md:items-start md:justify-between">
                <div class="flex items-start md:items-center gap-3">                  
                    <div class="w-10 h-10 md:w-15 md:h-15 text-xl md:text-4xl p-2 flex items-center justify-center bg-indigo-100 dark:bg-indigo-500 rounded-lg">
                      {{ journal.journal_category?.icon }}
                    </div>
                    <div>
                      <h3 class="font-semibold text-lg">{{ journal.title }}</h3>
                      <p class="text-sm opacity-50">                        
                          {{ journal.journal_category?.name }}
                      </p>
                    </div>
                </div>
                <div class="text-right">
                    <JournalBadgeStatus :status="journal.status" />
                </div>
            </div>
        </template>
    </Card>
  
    <!-- Category & Project Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <template #content>
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
                <Badge class="ml-1" v-if="journal.user?.user_roles" severity="contrast">
                    {{ journal.user.user_roles[0] }}
                </Badge>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card v-if="journal.webhost || journal.cs_main_project">
        <template #content>
          <div class="flex items-center gap-3">            
            <div class="w-10 h-10 p-2 flex items-center justify-center bg-teal-100 dark:bg-teal-500 rounded-lg">
              <Icon name="lucide:globe" class="text-teal-600 dark:text-white" />
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
        </template>
      </Card>
    </div>

    <!-- Time Info -->
    <Card>
      <template #content>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
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
      </template>
    </Card>

    <!-- Description -->
    <Card v-if="journal.description">
      <template #content>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-10 h-10 p-2 flex items-center justify-center bg-zinc-100 dark:bg-zinc-500 rounded-lg">
              <Icon name="lucide:file-text" class="text-zinc-600 dark:text-white" />
            </div>
          <span class="font-medium">Deskripsi</span>
        </div>
        <div class="prose prose-sm max-w-none text-sm">
          <p class="whitespace-pre-wrap">{{ journal.description }}</p>
        </div>
      </template>
    </Card>

    <!-- Detail Support -->
    <Card v-if="journal.detail_support">
      <template #content>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-10 h-10 p-2 flex items-center justify-center bg-purple-100 dark:bg-purple-500 rounded-lg">
              <Icon name="lucide:headphones" class="text-purple-600 dark:text-white" />
            </div>
          <span class="font-medium">Detail Support</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="journal.detail_support.hp" class="flex items-center gap-3">
            <div class="w-8 h-8 p-1.5 flex items-center justify-center bg-blue-100 dark:bg-blue-500 rounded-lg">
              <Icon name="lucide:phone" class="text-blue-600 dark:text-white text-sm" />
            </div>
            <div>
              <div class="text-xs opacity-50">No. HP</div>
              <div class="text-sm font-medium">{{ journal.detail_support.hp }}</div>
            </div>
          </div>
          
          <div v-if="journal.detail_support.wa" class="flex items-center gap-3">
            <div class="w-8 h-8 p-1.5 flex items-center justify-center bg-green-100 dark:bg-green-500 rounded-lg">
              <Icon name="lucide:message-circle" class="text-green-600 dark:text-white text-sm" />
            </div>
            <div>
              <div class="text-xs opacity-50">WhatsApp</div>
              <div class="text-sm font-medium">{{ journal.detail_support.wa }}</div>
            </div>
          </div>
          
          <div v-if="journal.detail_support.email" class="flex items-center gap-3">
            <div class="w-8 h-8 p-1.5 flex items-center justify-center bg-red-100 dark:bg-red-500 rounded-lg">
              <Icon name="lucide:mail" class="text-red-600 dark:text-white text-sm" />
            </div>
            <div>
              <div class="text-xs opacity-50">Email</div>
              <div class="text-sm font-medium">{{ journal.detail_support.email }}</div>
            </div>
          </div>
          
          <div v-if="journal.detail_support.biaya" class="flex items-center gap-3">
            <div class="w-8 h-8 p-1.5 flex items-center justify-center bg-yellow-100 dark:bg-yellow-500 rounded-lg">
              <Icon name="lucide:dollar-sign" class="text-yellow-600 dark:text-white text-sm" />
            </div>
            <div>
              <div class="text-xs opacity-50">Biaya</div>
              <div class="text-sm font-medium">{{ formatCurrency(journal.detail_support.biaya) }}</div>
            </div>
          </div>
          
          <div v-if="journal.detail_support.tanggal_bayar" class="flex items-center gap-3">
            <div class="w-8 h-8 p-1.5 flex items-center justify-center bg-indigo-100 dark:bg-indigo-500 rounded-lg">
              <Icon name="lucide:calendar-check" class="text-indigo-600 dark:text-white text-sm" />
            </div>
            <div>
              <div class="text-xs opacity-50">Tanggal Bayar</div>
              <div class="text-sm font-medium">{{ formatDate(journal.detail_support.tanggal_bayar, 'DD MMM YYYY') }}</div>
            </div>
          </div>
        </div>
      </template>
    </Card>

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

defineProps<Props>();

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
</script>