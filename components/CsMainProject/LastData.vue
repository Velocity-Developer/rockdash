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

              <!-- Jika created_at kurang dari 1 jam, maka tampilkan "baru" -->
              <Badge v-if="isNew(slotProps.data.cs_main_project_info.created_at)" size="small" severity="success">*</Badge>
              
            </template>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
const client = useSanctumClient();

const data = ref([] as any)
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

// Method to check if the project is new (created within the last hour)
const isNew = (createdAt: string) => {
  const now = new Date();
  const projectDate = new Date(createdAt);
  const diffInHours = (now.getTime() - projectDate.getTime()) / (1000 * 60 * 60);
  return diffInHours < 1;
}
</script>
