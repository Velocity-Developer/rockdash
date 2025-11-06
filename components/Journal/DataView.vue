<template>
    <DataView :value="data" :pt="{
        content: {
          class: '!bg-transparent'
        }
      }">
        <template #list="slotProps">
          <div class="flex flex-col gap-3">
              <Card v-for="(item, index) in slotProps.items" :key="index">
                <template #content>
                  <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-start">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span v-if="item.journal_category" class="noto-emoji w-5 h-5 flex items-center justify-center bg-indigo-200 text-sm p-2 rounded-full">
                          {{ item.journal_category?.icon }}
                        </span>
                        <Badge v-if="item.journal_category" class="bg-indigo-200 text-indigo-800" size="small">{{ item.journal_category?.name }}</Badge>
                      </div>
                      <JournalBadgeStatus :status="item.status" />
                    </div>
                    <div class="font-bold hover:underline cursor-pointer text-sm md:text-base" @click="openPreviewDialog(item)">
                      {{ item.title }}
                    </div>
                    <div class="text-xs md:text-sm text-gray-600 line-clamp-2">{{ item.description }}</div>

                    <div class="flex flex-col md:flex-row md:items-center gap-2 text-xs md:text-sm">
                        <div class="flex items-center gap-2">
                          <Avatar :image="item.user?.avatar_url" shape="circle" size="small" class="w-4 h-4 md:w-5 md:h-5" />
                          <div class="font-medium">{{ item.user?.name }}</div>
                        </div>
                        <div class="flex items-center gap-1">
                          <Icon name="lucide:clock" class="w-3 h-3 md:w-4 md:h-4"/>
                          <div>{{ formatDate(item.start,'DD/MM/YY HH:mm') }}</div>
                          <div v-if="item.end"> - {{ formatDate(item.end,'DD/MM/YY HH:mm') }}</div>
                        </div>
                        <div class="flex items-center gap-1">
                          <Icon name="lucide:globe" class="w-3 h-3 md:w-4 md:h-4"/>
                          <span class="truncate">{{ item.webhost?.nama_web }}</span>
                        </div>
                    </div>

                    <!-- Detail Support -->
                    <div v-if="item.detail_support" class="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div class="flex items-center gap-2 mb-2">
                        <Icon name="lucide:headphones" class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span class="text-xs font-medium text-purple-700 dark:text-purple-300">Detail Support</span>
                      </div>
                      <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div v-if="item.detail_support.hp" class="flex items-center gap-1">
                          <Icon name="lucide:phone" class="w-3 h-3 text-blue-500" />
                          <span class="truncate">{{ item.detail_support.hp }}</span>
                        </div>
                        <div v-if="item.detail_support.wa" class="flex items-center gap-1">
                          <Icon name="lucide:message-circle" class="w-3 h-3 text-green-500" />
                          <span class="truncate">{{ item.detail_support.wa }}</span>
                        </div>
                        <div v-if="item.detail_support.email" class="flex items-center gap-1">
                          <Icon name="lucide:mail" class="w-3 h-3 text-red-500" />
                          <span class="truncate">{{ item.detail_support.email }}</span>
                        </div>
                        <div v-if="item.detail_support.biaya" class="flex items-center gap-1">
                          <Icon name="lucide:dollar-sign" class="w-3 h-3 text-yellow-500" />
                          <span class="truncate">{{ formatCurrency(item.detail_support.biaya) }}</span>
                        </div>
                        <div v-if="item.detail_support.tanggal_bayar" class="flex items-center gap-1">
                          <Icon name="lucide:calendar-check" class="w-3 h-3 text-indigo-500" />
                          <span class="truncate">{{ formatDate(item.detail_support.tanggal_bayar, 'DD/MM/YY') }}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </template>
              </Card>
          </div>
        </template>
      </DataView>
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

