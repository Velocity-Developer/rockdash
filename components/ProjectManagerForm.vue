<template>
    
    <div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Basic Project Info -->
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-48">Jenis</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ data.jenis }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Nama Web</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ data.webhost?.nama_web }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Masuk Tanggal</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ formatTanggal(data.tgl_masuk) }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Deadline Tanggal</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ formatTanggal(data.tgl_deadline) }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Paket</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ data.webhost?.paket?.paket }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Deskripsi</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ data.deskripsi || '-' }}</td>
            </tr>
            
            <!-- Webmaster Info -->
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Catatan Webmaster</td>
              <td class="px-4 py-3 text-sm text-gray-700">-</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Dikerjakan Oleh</td>
              <td class="px-4 py-3 text-sm text-gray-700">
                <span v-if="data.raw_dikerjakan && data.raw_dikerjakan.length > 0">
                  {{ data.raw_dikerjakan.join(', ') }}
                </span>
                <span v-else>-</span>
              </td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Webmaster</td>
              <td class="px-4 py-3 text-sm text-gray-700">
                <div v-if="data.wm_project?.user" class="flex items-center gap-2">
                  <img 
                    v-if="data.wm_project.user.avatar_url" 
                    :src="data.wm_project.user.avatar_url" 
                    :alt="data.wm_project.user.name"
                    class="w-6 h-6 rounded-full"
                  >
                  <span>{{ data.wm_project.user.name }}</span>
                  <span class="text-xs text-gray-500">({{ data.wm_project.user.user_roles?.join(', ') }})</span>
                </div>
                <span v-else>-</span>
              </td>
            </tr>
            
            <!-- Project Management Dates -->
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Konfirmasi Revisi 1</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ formatTanggal(data.pm_project?.konfirm_revisi_1) }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Follow up revisi</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ formatTanggal(data.pm_project?.fr1) }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Rev 1</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ formatTanggal(data.client_supports?.revisi_1) }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Rev 1 + Konf. REV 2</td>
              <td class="px-4 py-3 text-sm text-gray-700">-</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Rev 2 + Konf. Lunas</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ formatTanggal(data.client_supports?.revisi_2) }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Lunas</td>
              <td class="px-4 py-3 text-sm text-gray-700">
                <span :class="data.lunas === 'lunas' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                  {{ data.lunas }}
                </span>
              </td>
            </tr>
            
            <!-- Financial Info -->
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Saldo</td>
              <td class="px-4 py-3 text-sm text-gray-700">
                <span class="font-medium">{{ formatMoney(data.biaya - data.dibayar) }}</span>
                <span class="text-xs text-gray-500 ml-2">
                  (Biaya: {{ formatMoney(data.biaya) }} - Dibayar: {{ formatMoney(data.dibayar) }})
                </span>
              </td>
            </tr>
            
            <!-- Additional Info -->
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Tutorial + Password</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ formatTanggal(data.pm_project?.tutorial_password) }}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">No. HP</td>
              <td class="px-4 py-3 text-sm text-gray-700">-</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">BBM</td>
              <td class="px-4 py-3 text-sm text-gray-700">-</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">WA</td>
              <td class="px-4 py-3 text-sm text-gray-700">-</td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Email</td>
              <td class="px-4 py-3 text-sm text-gray-700">-</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Client Supports Section -->
      <div v-if="data.cs_main_project_client_supports && data.cs_main_project_client_supports.length > 0" class="mt-6">
        <h4 class="text-md font-semibold text-gray-900 mb-3">Client Supports</h4>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div 
              v-for="support in data.cs_main_project_client_supports" 
              :key="support.id"
              class="bg-white rounded-md p-3 border border-gray-200"
            >
              <div class="text-sm font-medium text-gray-900">{{ support.layanan }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatTanggal(support.tanggal) }}</div>
            </div>
          </div>
        </div>
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
