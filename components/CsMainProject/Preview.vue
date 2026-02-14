<script setup lang="ts">
const client = useSanctumClient();
const props = defineProps<{ id: number | string }>();

const data = ref(null as any)
const loading = ref(false)

const getData = async () => {
  if(!props.id) return;
  loading.value = true
  try {
    const res = await client('/api/cs_main_project/'+props.id);
    data.value = res;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false
  }
}

watch(() => props.id, () => {
  getData()
}, { immediate: true })
</script>

<template>
  <div class="text-sm">
    <div v-if="loading">Memuat data...</div>
    <div v-else-if="data">
      <div class="font-semibold">{{ data.jenis }}</div>
      <div class="opacity-70">{{ data.webhost?.nama_web }}</div>
      <div class="mt-2">Status: {{ data.status }}</div>
      <div class="mt-1">Trf: {{ data.trf }}</div>
      <div class="mt-1">Masuk: {{ data.tgl_masuk }}</div>
    </div>
    <div v-else>Data tidak ditemukan</div>
  </div>
</template>

<style scoped></style>
