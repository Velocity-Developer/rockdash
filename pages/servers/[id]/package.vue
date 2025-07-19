<template>
  
  <ServerLayout :id="id" @data="getServers($event)">
    <div class="mb-5">
      <h1 class="text-xl">Package : {{ dataServer.name }}</h1>
    </div>
    
    <div class="text-end mb-5">
      <Button @click="getData()" size="small" :loading="loading">
        <Icon name="lucide:refresh-cw" :class="{ 'animate-spin': loading }"/> Reload
      </Button>
    </div>

    <DataTable v-if="data && data.length > 0" :value="data"      
      paginator :rows="20" :rowsPerPageOptions="[20, 50, 100, 500]"
      size="small" class="text-sm"
      stripedRows scrollable
    >
      <Column field="no" header="No">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>
      <Column field="data" header="Package">
        <template #body="slotProps">
          {{ slotProps.data }}
        </template>
      </Column>
      <Column field="" header="">
        <template #body="slotProps">
          <div class="flex justify-end">
            <Button @click="openDialog(slotProps.data)" size="small">
              <Icon name="lucide:globe" size="small"/> Lihat
            </Button>
          </div>
        </template>
      </Column>
    </DataTable>

    <div v-if="loading">
      <Skeleton v-for="i in 15" class="h-10 mb-1" />
    </div>

    <Message v-if="error" severity="error">
      {{ error }}
    </Message>

  </ServerLayout>

  <Dialog v-model:visible="visibleDialog" modal header="Package" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <ServerPackagePreview :packageName="selectedItem" :server="id"/>
  </Dialog>

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
const error = ref('' as any)
const getData = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await client('/api/servers_packages/'+id)
    loading.value = false
    data.value = res
  } catch (e : any) {
    const er = useSanctumError(e)
    loading.value = false
    error.value = e.data?.message
  }
}
onMounted(() => {
  getData()
})

const visibleDialog = ref(false);
const selectedItem = ref({} as any);
const openDialog = (item: any) => {
  selectedItem.value = item
  visibleDialog.value = true
}
</script>
