<template>
  <DataTable :value="data" stripedRows responsiveLayout="scroll" class="p-datatable-sm">
    <Column field="title" header="Judul" :sortable="true">
      <template #body="slotProps">
        <div class="flex flex-col gap-1">
          <div class="flex items-start gap-2">
            <span v-tooltip="slotProps.data.journal_category?.name" class="w-5 h-5 flex items-center justify-center bg-indigo-200 text-sm p-1 rounded-full">
              {{ slotProps.data.journal_category?.icon }}
            </span>
            <div>
              <div class="font-bold hover:underline cursor-pointer text-sm mb-2" @click="openPreviewDialog(slotProps.data)">
                {{ slotProps.data.title }}
              </div>
            </div>
          </div>
          
        </div>
      </template>
    </Column>
    
    <Column field="description" header="Deskripsi" :sortable="false">
      <template #body="slotProps">
        <div class="text-xs text-gray-600 line-clamp-2 max-w-xs">
          {{ slotProps.data.description }}
        </div>
      </template>
    </Column>
    
    <Column field="status" header="Status" :sortable="true" style="width: 120px">
      <template #body="slotProps">
        <JournalBadgeStatus :status="slotProps.data.status" />
      </template>
    </Column>
    
    <Column field="user.name" header="User" :sortable="true" style="width: 60px">
      <template #body="slotProps">
        <div class="flex justify-center">
          <Avatar 
            :image="slotProps.data.user?.avatar_url" 
            shape="circle" 
            size="small" 
            class="w-8 h-8" 
            v-tooltip.top="slotProps.data.user?.name"
          />
        </div>
      </template>
    </Column>
    
    <Column field="start" header="Waktu" :sortable="true" style="width: 200px">
      <template #body="slotProps">
        <div class="flex flex-col gap-1 text-xs">
          <div class="flex items-center gap-1">
            <Icon name="lucide:clock" class="w-3 h-3"/>
            <div>{{ formatDate(slotProps.data.start,'DD/MM/YY HH:mm') }}</div>
          </div>
          <div v-if="slotProps.data.end" class="text-gray-500">
            {{ formatDate(slotProps.data.end,'DD/MM/YY HH:mm') }}
          </div>
        </div>
      </template>
    </Column>
    
    <Column field="webhost.nama_web" header="Webhost" :sortable="true" style="width: 150px">
      <template #body="slotProps">
        <div class="flex items-center gap-1 text-xs">
          <Icon name="lucide:globe" class="w-3 h-3"/>
          <span class="truncate">{{ slotProps.data.webhost?.nama_web }}</span>
        </div>
      </template>
    </Column>
    
    <Column header="Detail Support" :sortable="false" style="width: 200px">
      <template #body="slotProps">
        <div v-if="slotProps.data.detail_support" class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
          <div class="flex items-center gap-1 mb-1">
            <Icon name="lucide:headphones" class="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span class="text-xs font-medium text-purple-700 dark:text-purple-300">Support</span>
          </div>
          <div class="grid grid-cols-1 gap-1 text-xs">
            <div v-if="slotProps.data.detail_support.hp" class="flex items-center gap-1">
              <Icon name="lucide:phone" class="w-2 h-2 text-blue-500" />
              <span class="truncate">{{ slotProps.data.detail_support.hp }}</span>
            </div>
            <div v-if="slotProps.data.detail_support.wa" class="flex items-center gap-1">
              <Icon name="lucide:message-circle" class="w-2 h-2 text-green-500" />
              <span class="truncate">{{ slotProps.data.detail_support.wa }}</span>
            </div>
            <div v-if="slotProps.data.detail_support.email" class="flex items-center gap-1">
              <Icon name="lucide:mail" class="w-2 h-2 text-red-500" />
              <span class="truncate">{{ slotProps.data.detail_support.email }}</span>
            </div>
            <div v-if="slotProps.data.detail_support.biaya" class="flex items-center gap-1">
              <Icon name="lucide:dollar-sign" class="w-2 h-2 text-yellow-500" />
              <span class="truncate">{{ formatCurrency(slotProps.data.detail_support.biaya) }}</span>
            </div>
            <div v-if="slotProps.data.detail_support.tanggal_bayar" class="flex items-center gap-1">
              <Icon name="lucide:calendar-check" class="w-2 h-2 text-indigo-500" />
              <span class="truncate">{{ formatDate(slotProps.data.detail_support.tanggal_bayar, 'DD/MM/YY') }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-xs text-gray-400">-</div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array,
    default: () => ([])
  }
})
const emit = defineEmits(['openPreviewDialog'])

const openPreviewDialog = (item: any) => {
  emit('openPreviewDialog', item)
}

// Function untuk format currency
const formatCurrency = (amount: string | number) => {
  if (!amount) return ''
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)
}
</script>
