<template>

  <div class="flex justify-between items-center mb-3">
    <div class="font-bold">
      {{ props.tanggal }}
    </div>
    <Button @click="visibleDialog = true" size="small">
      <Icon name="lucide:plus-circle" /> Tambah
    </Button>
  </div>

  <div v-if="dataClientSupport && dataClientSupport.count > 0" class="overflow-x-auto text-sm">
    <table class="w-full table-auto">
      <thead>
        <tr>
          <th class="px-4 py-2 border text-left">Nama Web</th>
          <th class="px-4 py-2 border text-left">Jenis</th>
          <th class="px-4 py-2 border text-left">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item_layanan,i) in dataClientSupport.data" :key="i">
          <tr class="even:bg-zinc-100 odd:bg-white dark:even:bg-zinc-800 dark:odd:bg-zinc-900">
            <td class="px-4 py-2 border font-bold" colspan="3">{{ labelLayanan(i) }}</td>
          </tr>
          <tr v-for="(item,index) in item_layanan" :key="index" class="even:bg-zinc-100 odd:bg-white dark:even:bg-zinc-800 dark:odd:bg-zinc-900">
            <td class="px-4 py-2 border">{{ item.nama_web }}</td>
            <td class="px-4 py-2 border">{{ item.jenis }}</td>
            <td class="px-4 py-2 border text-right">
              <Button size="small" severity="danger">
                <Icon name="lucide:x" />
              </Button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    
  </div>

  <Dialog 
    v-model:visible="visibleDialog" modal 
    :header="'Tambah'" 
    :style="{ width: '30rem' }" 
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <ClientSupportAdd :tanggal="props.tanggal" @submit="visibleDialog = false;getData()"/>
  </Dialog>

  <ProgressBar v-if="loading" mode="indeterminate" style="height: 6px"></ProgressBar>

</template>

<script setup lang="ts">
const props = defineProps({
  tanggal: {
    type: String,
    default: () => '',
  },
})
const client = useSanctumClient()
const toast = useToast()

const dataClientSupport = ref<any>({})
const loading = ref(false)
const getData = async () => {
  try {
    loading.value = true
    const res = await client(`/api/client_support_by_tgl/${props.tanggal}`) as any
    dataClientSupport.value = res
  } catch (error) {
    console.log(error)
    loading.value = false
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getData()
})

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
  }
}

const visibleDialog = ref(false)
</script>
