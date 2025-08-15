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
                        <span class="w-5 h-5 flex items-center justify-center bg-indigo-200 text-sm p-2 rounded-full">
                          {{ item.journal_category?.icon }}
                        </span>
                        <Badge class="bg-indigo-200 text-indigo-800" size="small">{{ item.journal_category?.name }}</Badge>
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
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['openPreviewDialog'])

const openPreviewDialog = (item: any) => {
  emit('openPreviewDialog', item)
}
</script>

