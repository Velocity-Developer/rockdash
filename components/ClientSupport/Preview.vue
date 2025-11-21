<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
})
const emit = defineEmits(['edit'])

const labelLayanan = (i: any) => {
  if(i === 'revisi_1') {
    return 'Revisi 1'
  } else if(i === 'perbaikan_revisi_1') {
    return 'Perbaikan Revisi 1'
  } else if(i === 'revisi_2') {
    return 'Revisi 2'
  } else if(i === 'perbaikan_revisi_2') {
    return 'Perbaikan Revisi 2'
  } else if(i === 'tanya_jawab') {
    return 'Tanya Jawab'
  } else if(i === 'update_web') {
    return 'Update Web'
  } else {
    return i
  }
}
</script>

<template>
  <div v-if="props.data" class="space-y-4">

    <div class="text-sm">
      {{ props.data?.tanggal }}
    </div>

    <div v-for="(item_layanan,i) in data" :key="i" class="space-y-4 mb-4">
      <template v-if="i !== 'tanggal'">
        <div class="text-sm font-bold">{{ labelLayanan(i) }}</div>
        <div class="space-y-2">
          <div v-for="(item,index) in item_layanan" :key="index" class="flex justify-between items-center border dark:border-gray-700 px-4 py-2 rounded-md hover:shadow transition-all hover:bg-primary-50 dark:hover:bg-gray-700">
            <div>
              <div>{{ item.nama_web }}</div> 
              <div class="text-xs text-primary-500" v-if="item.jenis">                
                {{ item.jenis }}
              </div>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <div v-if="item.user?.avatar" class="w-4 h-4 rounded-full">
                <img :src="item.user?.avatar" alt="avatar" class="w-full h-full rounded-full">
              </div>
              <div v-if="item.user?.name">
                {{ item.user?.name }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <div class="text-end">
      <Button @click="emit('edit',props.data)">Edit</Button>
    </div>

  </div>
</template>

<style scoped></style>
