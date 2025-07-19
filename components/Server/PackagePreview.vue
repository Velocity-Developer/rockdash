<template>
  
  <div>
    Component: Server/PackagePreview
  </div>

  {{ data }}

</template>

<script setup lang="ts">
const props = defineProps({
  packageName: {
    type: String,
    required: true,
  },
  server: {
    type: Number,
    required: true,
  }
})
const client = useSanctumClient()

const loading = ref(false)
const data = ref({} as any)
const getData = async () => {
  loading.value = true
  try {
    loading.value = true
    const res = await client('/api/servers_package_detail/'+props.server+'/'+props.packageName)
    loading.value = false
    data.value = res
  } catch (error) {
    const er = useSanctumError(error)
    loading.value = false
  }
}
onMounted(() => {
  getData()
})
</script>

