<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <!-- Client Information Section -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon name="lucide:user" class="text-blue-600" size="16" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900">Client Information</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Website Name</label>
          <input 
            v-if="props.action === 'edit'"
            type="text" 
            :value="data.webhost?.nama_web || ''"
            placeholder="Enter website name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ data.webhost?.nama_web || '-' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Website Type</label>
          <select v-if="props.action === 'edit'" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>{{ data.jenis || 'Select type' }}</option>
          </select>
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ data.jenis || '-' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
          <input 
            v-if="props.action === 'edit'"
            type="text" 
            value=""
            placeholder="Enter client name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            -
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Package</label>
          <select v-if="props.action === 'edit'" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>{{ data.webhost?.paket?.paket || 'Select package' }}</option>
          </select>
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ data.webhost?.paket?.paket || '-' }}
          </div>
        </div>
      </div>
    </div>

    <!-- After Sales Information Section -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <Icon name="lucide:calendar-check" class="text-green-600" size="16" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900">After Sales Information</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Revision 1 Confirmation Date</label>
          <input 
            v-if="props.action === 'edit'"
            type="date" 
            :value="formatDateForInput(data.pm_project?.konfirm_revisi_1)"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.pm_project?.konfirm_revisi_1) }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Revision 1 Date</label>
          <input 
            v-if="props.action === 'edit'"
            type="date" 
            :value="formatDateForInput(data.client_supports?.revisi_1)"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.client_supports?.revisi_1) }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Revision 2 Confirmation Date</label>
          <input 
            v-if="props.action === 'edit'"
            type="date" 
            :value="formatDateForInput(data.pm_project?.fr1)"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.pm_project?.fr1) }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Revision 2 Date</label>
          <input 
            v-if="props.action === 'edit'"
            type="date" 
            :value="formatDateForInput(data.client_supports?.revisi_2)"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.client_supports?.revisi_2) }}
          </div>
        </div>
        
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tutorial & Password Delivery Date</label>
          <input 
            v-if="props.action === 'edit'"
            type="date" 
            :value="formatDateForInput(data.pm_project?.tutorial_password)"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.pm_project?.tutorial_password) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Client Contact Information Section -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <Icon name="lucide:phone" class="text-purple-600" size="16" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900">Client Contact Information</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="lucide:phone" class="text-gray-400" size="16" />
            </div>
            <input 
              v-if="props.action === 'edit'"
              type="tel" 
              value=""
              placeholder="+62 xxx xxxx xxxx"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div v-else class="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
              -
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="lucide:message-circle" class="text-gray-400" size="16" />
            </div>
            <input 
              v-if="props.action === 'edit'"
              type="tel" 
              value=""
              placeholder="+62 xxx xxxx xxxx"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div v-else class="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
              -
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Telegram</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="lucide:at-sign" class="text-gray-400" size="16" />
            </div>
            <input 
              v-if="props.action === 'edit'"
              type="text" 
              value=""
              placeholder="@username"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div v-else class="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
              -
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="lucide:mail" class="text-gray-400" size="16" />
            </div>
            <input 
              v-if="props.action === 'edit'"
              type="email" 
              value=""
              placeholder="client@example.com"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div v-else class="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
              -
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Project Information -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon name="lucide:info" class="text-gray-600" size="16" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900">Additional Information</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Entry Date</label>
          <input 
            v-if="props.action === 'edit'"
            type="date" 
            :value="formatDateForInput(data.tgl_masuk)"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.tgl_masuk) }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Deadline Date</label>
          <input 
            v-if="props.action === 'edit'"
            type="date" 
            :value="formatDateForInput(data.tgl_deadline)"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-else class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {{ formatTanggal(data.tgl_deadline) }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div class="flex items-center gap-2">
            <span :class="data.lunas === 'lunas' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                  class="px-3 py-1 rounded-full text-sm font-medium">
              {{ data.lunas }}
            </span>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Balance</label>
          <div class="text-lg font-semibold" :class="(data.biaya - data.dibayar) > 0 ? 'text-red-600' : 'text-green-600'">
            {{ formatMoney(data.biaya - data.dibayar) }}
          </div>
          <div class="text-xs text-gray-500">
            Cost: {{ formatMoney(data.biaya) }} - Paid: {{ formatMoney(data.dibayar) }}
          </div>
        </div>
        
        <div v-if="data.wm_project?.user" class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Webmaster</label>
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
            <img 
              v-if="data.wm_project.user.avatar_url" 
              :src="data.wm_project.user.avatar_url" 
              :alt="data.wm_project.user.name"
              class="w-10 h-10 rounded-full"
            >
            <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center" v-else>
              <Icon name="lucide:user" class="text-gray-600" size="20" />
            </div>
            <div>
              <div class="font-medium text-gray-900">{{ data.wm_project.user.name }}</div>
              <div class="text-sm text-gray-500">{{ data.wm_project.user.user_roles?.join(', ') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Client Supports Section -->
    <div v-if="data.cs_main_project_client_supports && data.cs_main_project_client_supports.length > 0" 
         class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon name="lucide:headphones" class="text-blue-600" size="16" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900">Client Supports</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="support in data.cs_main_project_client_supports" 
          :key="support.id"
          class="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
        >
          <div class="font-medium text-gray-900 mb-1">{{ support.layanan }}</div>
          <div class="text-sm text-gray-500">{{ formatTanggal(support.tanggal) }}</div>
        </div>
      </div>
    </div>

    <!-- Save Button - Only show in edit mode -->
    <div v-if="props.action === 'edit'" class="flex justify-end">
      <button 
        type="button"
        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <Icon name="lucide:save" class="inline-block mr-2" size="16" />
        Simpan
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
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

// Helper function to format date for input
const formatDateForInput = (date: string | null | undefined) => {
  if (!date || date === '0000-00-00' || date === '0000-00-00 00:00:00') {
    return ''
  }
  
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return ''
    }
    
    return dateObj.toISOString().split('T')[0]
  } catch (error) {
    return ''
  }
}

// Helper function to format money
const formatMoney = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) {
    return 'Rp 0'
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
</script>
