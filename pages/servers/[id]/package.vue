<template>
  
  <ServerLayout :id="id" @data="getServers($event)">
    <div class="mb-5">
      <h1 class="text-xl">Package : {{ dataServer.name }}</h1>
    </div>
    
    <div class="text-end">
      <Button @click="getData()" size="small" :loading="loading">
        <Icon name="lucide:refresh-cw" :class="{ 'animate-spin': loading }"/> Reload
      </Button>
    </div>

    {{ data }}

  </ServerLayout>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Servers',
})
const client = useSanctumClient()

const route = useRoute()
const id = Number(route.params.id) || 0

const dataServer = ref({} as any)
const getServers = (data: any) => {
  dataServer.value = data
}

const loading = ref(false)
const data = ref({} as any)
const getData = async () => {
  loading.value = true
  try {
    const res = await client('/api/servers_packages/'+id)
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
