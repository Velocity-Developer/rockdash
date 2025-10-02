<template>
  <div>
    <!-- Project Information Section -->
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon name="lucide:briefcase" class="text-blue-600" size="16" />
        </div>
        <h2 class="text-lg font-semibold">Informasi Project</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium opacity-50 mb-2">Nama Website</label>
          <div class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 rounded-md">
            {{ data.webhost?.nama_web || '-' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium opacity-50 mb-2">Jenis</label>
          <div class="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-950">
            {{ data.jenis || '-' }}
          </div>
        </div>
                
        <div>
          <label class="block text-sm font-medium opacity-50 mb-2">Paket</label>
          <div class="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-950">
            {{ data.webhost?.paket?.paket || '-' }}
          </div>
        </div>
                
        <div v-if="data.wm_project?.user">
          <label class="block text-sm font-medium opacity-50 mb-2">Webmaster</label>
          <div class="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-950">
            {{ data.wm_project.user.name || '-' }}
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium opacity-50 mb-2">Tanggal Masuk</label>
          <div class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-950">
            {{ formatTanggal(data.tgl_masuk) }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium opacity-50 mb-2">Tanggal Deadline</label>
          <div class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-950">
            {{ formatTanggal(data.tgl_deadline) }}
          </div>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium opacity-50 mb-2">Selesai</label>
          <DatePicker 
            v-if="props.action === 'edit'"
            v-model="formData.selesai"
            dateFormat="yy-mm-dd" 
            class="w-full"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.pm_project?.selesai) }}
          </div>
        </div>

      </div>
    </div>

    <!-- Revision Information Section -->
    <div class="my-10">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <Icon name="lucide:calendar-check" class="text-green-600" size="16" />
        </div>
        <h2 class="text-lg font-semibold">Revisi</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium opacity-50 mb-2">Konfirmasi Revisi 1</label>
          <DatePicker 
            v-if="props.action === 'edit'"
            v-model="formData.konfirm_revisi_1"
            dateFormat="yy-mm-dd" 
            class="w-full"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.pm_project?.konfirm_revisi_1) }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium opacity-50 mb-2">Revisi 1</label>
          <DatePicker 
            v-if="props.action === 'edit'"
            v-model="formData.revisi_1"
            dateFormat="yy-mm-dd" 
            class="w-full"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.client_supports?.revisi_1) }}
          </div>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium opacity-50 mb-2">Follow up revisi</label>
          <DatePicker 
            v-if="props.action === 'edit'"
            v-model="formData.fr1"
            dateFormat="yy-mm-dd" 
            class="w-full"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.pm_project?.fr1) }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium opacity-50 mb-2">Konfirmasi Revisi 2</label>
          <DatePicker 
            v-if="props.action === 'edit'"
            v-model="formData.konfirm_revisi_2"
            dateFormat="yy-mm-dd" 
            class="w-full"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.pm_project?.konfirm_revisi_2) }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium opacity-50 mb-2">Revisi 2</label>
          <DatePicker 
            v-if="props.action === 'edit'"
            v-model="formData.revisi_2"
            dateFormat="yy-mm-dd" 
            class="w-full"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.client_supports?.revisi_2) }}
          </div>
        </div>
        
        <div class="md:col-span-2">
          <label class="block text-sm font-medium opacity-50 mb-2">Tutorial & Password</label>
          <DatePicker 
            v-if="props.action === 'edit'"
            v-model="formData.tutorial_password"
            dateFormat="yy-mm-dd" 
            class="w-full"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.pm_project?.tutorial_password) }}
          </div>
        </div>

      </div>
    </div>

    <!-- Client Contact Information Section -->
    <div class="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 p-6">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <Icon name="lucide:phone" class="text-purple-600" size="16" />
        </div>
        <h2 class="text-lg font-semibold">Informasi Klien</h2>
      </div>

      <ProgressBar v-if="loadingDataWebhost" mode="indeterminate" style="height: 6px"></ProgressBar>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium opacity-50 mb-2">HP</label>          
          <div class="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-950">
            {{ dataWebhost?.hp || '-' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium opacity-50 mb-2">WhatsApp</label>  
          <div class="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-950">
            {{ dataWebhost?.wa || '-' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium opacity-50 mb-2">Email</label>
          <div class="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-950">
            {{ dataWebhost?.email || '-' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button - Only show in edit mode -->
    <div v-if="props.action === 'edit'" class="flex justify-end mt-4">
      <Button 
        type="button"
        @click="handleSave"        
      >
        <Icon name="lucide:save" />
        Simpan
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  action: {
    type: String,
    default: 'edit',
  }
})
const client = useSanctumClient()

// Reactive form data for date fields
const formData = reactive({
  selesai: null,
  konfirm_revisi_1: null,
  revisi_1: null,
  fr1: null,
  konfirm_revisi_2: null,
  revisi_2: null,
  tutorial_password: null,
} as any)

// Initialize form data with existing values
onMounted(() => {
  if (props.data.pm_project?.selesai && props.data.pm_project.selesai !== '0000-00-00') {
    formData.selesai = new Date(props.data.pm_project.selesai)
  }
  if (props.data.pm_project?.konfirm_revisi_1 && props.data.pm_project.konfirm_revisi_1 !== '0000-00-00') {
    formData.konfirm_revisi_1 = new Date(props.data.pm_project.konfirm_revisi_1)
  }
  if (props.data.client_supports?.revisi_1 && props.data.client_supports.revisi_1 !== '0000-00-00') {
    formData.revisi_1 = new Date(props.data.client_supports.revisi_1)
  }
  if (props.data.pm_project?.fr1 && props.data.pm_project.fr1 !== '0000-00-00') {
    formData.fr1 = new Date(props.data.pm_project.fr1)
  }
  if (props.data.pm_project?.konfirm_revisi_2 && props.data.pm_project.konfirm_revisi_2 !== '0000-00-00') {
    formData.konfirm_revisi_2 = new Date(props.data.pm_project.konfirm_revisi_2)
  }
  if (props.data.client_supports?.revisi_2 && props.data.client_supports.revisi_2 !== '0000-00-00') {
    formData.revisi_2 = new Date(props.data.client_supports.revisi_2)
  }
  if (props.data.pm_project?.tutorial_password && props.data.pm_project.tutorial_password !== '0000-00-00') {
    formData.tutorial_password = new Date(props.data.pm_project.tutorial_password)
  }
})

// Helper function to format dates
const formatTanggal = (date: string | null | undefined) => {
  if (!date || date === '0000-00-00' || date === '0000-00-00 00:00:00') {
    return '-'
  }
  
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return '-'
    }
    
    return dateObj.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return '-'
  }
}

const loadingDataWebhost = ref(false)
const dataWebhost = ref({} as any)
const getDataWebhost = async () => {
  if (props.data.webhost.id_webhost) {
    loadingDataWebhost.value = true
    try {
      const response = await client(`api/webhost/${props.data.webhost.id_webhost}`) as any
      dataWebhost.value = response
    } catch (error) {
      console.error('Error fetching webhost data:', error)
    } finally {
      loadingDataWebhost.value = false
    }
  }
}

// Handle save functionality
const handleSave = () => {
  // Format dates using Day.js before saving
  const formattedData = {
    selesai: formData.selesai ? dayjs(formData.selesai).format('YYYY-MM-DD') : null,
    konfirm_revisi_1: formData.konfirm_revisi_1 ? dayjs(formData.konfirm_revisi_1).format('YYYY-MM-DD') : null,
    revisi_1: formData.revisi_1 ? dayjs(formData.revisi_1).format('YYYY-MM-DD') : null,
    fr1: formData.fr1 ? dayjs(formData.fr1).format('YYYY-MM-DD') : null,
    konfirm_revisi_2: formData.konfirm_revisi_2 ? dayjs(formData.konfirm_revisi_2).format('YYYY-MM-DD') : null,
    revisi_2: formData.revisi_2 ? dayjs(formData.revisi_2).format('YYYY-MM-DD') : null,
    tutorial_password: formData.tutorial_password ? dayjs(formData.tutorial_password).format('YYYY-MM-DD') : null,
  }
  
  console.log('Formatted date data:', formattedData)
  // Here you would typically send the data to your API
}

onMounted(() => {
  getDataWebhost()
})

</script>
