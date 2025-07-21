<template>
  
  <ServerLayout :id="id" @data="getServers($event)">
    <div class="mb-5">
      <h1 class="text-xl">Package : {{ dataServer.name }}</h1>
    </div>
    
    <div class="flex justify-end gap-1 mb-5">
      <Button v-if="checkboxItems && checkboxItems.length > 0" @click="syncPackageData()" size="small" severity="warn" :loading="loading" v-tooltip.left="'Sync data masing-masing package'">
        <Icon name="lucide:globe" :class="{ 'animate-spin': loading }" /> Sync Package
      </Button>
      <Select v-model="per_page"
        :options="[20, 50, 100]"
        @change="getData()" size="small"
      />
      <Button @click="syncData()" size="small" severity="success" :loading="loading" v-tooltip.left="'Sync data package dari server'">
        <Icon name="lucide:cloud-download"/> Sync
      </Button>
      <Button @click="getData()" size="small" :loading="loading">
        <Icon name="lucide:refresh-cw" :class="{ 'animate-spin': loading }"/> Reload
      </Button>
    </div>

    <div>
      <DataTable v-if="data.data && data.data.length > 0" :value="data.data"
        size="small" class="text-sm"
        stripedRows scrollable
        v-model:selection="checkboxItems"
      >
        <Column selectionMode="multiple" headerStyle="width: 1rem"></Column>
        <Column field="no" header="No">
          <template #body="slotProps">
            {{ slotProps.index + data.from }}
          </template>
        </Column>
        <Column field="name" header="Package">        
          <template #body="slotProps">
            <span @click="openDialog(slotProps.data)" class="cursor-pointer">
            {{ slotProps.data.name }}
            </span>
          </template>
          </Column>
        <Column field="server.name" header="Server"></Column>
        <Column field="quota" header="Quota"></Column>
        <Column field="email_daily_limit" header="Email"></Column>
        <Column field="inode" header="Inode"></Column>
        <Column field="bandwidth" header="Bandwidth"></Column>
        <Column field="" header="">
          <template #body="slotProps">
            <div class="flex justify-end">
              <Button @click="openDialog(slotProps.data)" size="small">
                <Icon name="lucide:settings-2" size="small"/>
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>
      <div class="flex justify-between items-center text-xs mt-3">
        <div>
          {{ data.from }} - {{ data.to }} dari {{ data.total }}
        </div>

        <Paginator
            :rows="data.per_page"
            :totalRecords="data.total"
            @page="onPaginate"
            :pt="{
                root: (event: any) => {
                    const itemForPage =  data.per_page;
                    const currentPage =  page - 1;
                    event.state.d_first = itemForPage * currentPage;
                },
            }"
        >
        </Paginator>
      </div>
    </div>

    <Message v-if="error" severity="error">
      {{ error }}
    </Message>

  </ServerLayout>

  <Dialog v-model:visible="visibleDialog" modal header="Package" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <ServerPackagePreview :package="selectedItem" :server="id" @update="getData()"/>
  </Dialog>

  <DashLoader :loading="loading"/>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Servers',
})
const client = useSanctumClient()

const route = useRoute()
const id = Number(route.params.id) || 0
const page = ref(route.query.page ? Number(route.query.page) : 1);
const per_page = ref(route.query.per_page ? Number(route.query.per_page) : 20);

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
    const res = await client('/api/server_packages',{
      params: {
        server_id: id,
        page: page.value,
        per_page: per_page.value
      }
    })
    loading.value = false
    data.value = res
  } catch (e : any) {
    const er = useSanctumError(e)
    loading.value = false
    error.value = e.data?.message
  }
}
const onPaginate = (event: { page: number }) => {
    page.value = event.page + 1;
    getData()
};

onMounted(() => {
  getData()
})

const visibleDialog = ref(false);
const selectedItem = ref({} as any);
const openDialog = (item: any) => {
  selectedItem.value = item
  visibleDialog.value = true
}

const syncData = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await client('/api/servers_sync_packages/'+id)
    loading.value = false
    getData()
  } catch (e : any) {
    const er = useSanctumError(e)
    loading.value = false
    error.value = e.data?.message
  }
}

const checkboxItems = ref();
const syncPackageData = async () => {
  loading.value = true
  error.value = ''

  //kumpulkan id dari checkboxItems
  const ids = checkboxItems.value.map((item: any) => item.id);

  //proses satu-persatu bergantian
  for (const id of ids) {
    try {
      const res = await client('/api/servers_sync_package_detail/'+id)
      loading.value = false
      getData()
    } catch (e : any) {
      const er = useSanctumError(e)
      loading.value = false
      error.value = e.data?.message
    }
  }

  loading.value = false
}
</script>
