<template>
  <div class="border p-4 rounded-md mt-4">
    <div class="text-sm font-bold mb-4 border-b pb-3">
      Billing project terbaru
    </div>
    <DataTable :value="data" size="small" class="text-xs">
      <Column field="webhost.nama_web" header="web" />
      <Column field="cs_main_project_info.created_at" header="Tanggal">
        <template #body="slotProps">
            <template v-if="slotProps.data.cs_main_project_info?.created_at">
              {{ formatDate(slotProps.data.cs_main_project_info.created_at,'YYYY-MM-DD HH:mm:ss') }}
            </template>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
const client = useSanctumClient();

const data = ref({} as any)
const getData = async () => {
  try {
    const res = await client('api/cs_main_project_lastdata');
    data.value = res;
  } catch (error) {
    console.log(error);
  }
}

onMounted(() => {
  getData();
})

// Expose the getData method so it can be called from parent component
defineExpose({
  getData
});
</script>
