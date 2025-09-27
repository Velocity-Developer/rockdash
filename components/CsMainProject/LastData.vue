<template>
  <div class="border p-4 rounded-md mt-4">
    <DataTable :value="data" size="small">
      <Column field="webhost.nama_web" header="web" />
      <Column field="cs_main_project_info.created_at" header="Tanggal" />
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
</script>
