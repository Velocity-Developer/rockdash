<script setup lang="ts">
definePageMeta({
    title: 'Koreksi Webhost',
})
const client = useSanctumClient();

//get data Webhost Koreksi
const { data: results ,status: statusGet, refresh: refreshData} = await useAsyncData(
    'webhost-ganda',
    () => client('/api/dash/koreksi-webhost/ganda')
) as any

const dataDetail = ref<any>({})
const loadingDetail = ref(false)
const getDetailWebhost = async (nama_web: string) => {
  loadingDetail.value = true
  try {
    const res = await client(`/api/dash/koreksi-webhost-data`,{
      method: 'GET',
      params: {
        nama_web: nama_web
      }
    }) as any
    dataDetail.value = res
  } catch (error) {
    console.log(error)
  } finally {
    loadingDetail.value = false
  }
}

const visibleDialog = ref(false)
const dataDialog = ref<any>({})
const openDialog = (data: any = null) => {
  visibleDialog.value = true
  dataDialog.value = data ? { ...data } : {}
  getDetailWebhost(data.nama_web || '')
}

</script>

<template>
  
  <div class="mx-auto space-y-4 max-w-3xl">

    <div class="flex justify-end">
      <Button @click="refreshData()" size="small">
        <Icon name="lucide:refresh-cw" :class="statusGet=='pending'?'animate-spin':''"/> Reload
      </Button>
    </div>

    <Card>
      <template #content>
        <DataTable :value="results" class="text-sm" :loading="statusGet=='pending'" stripedRows>
          <Column header="#" headerStyle="width:3rem">
            <template #body="slotProps">
                {{ slotProps.index + 1 }}
            </template>
          </Column>
            <Column field="nama_web" header="Nama Web">
              <template #body="slotProps">
                  {{ slotProps.data.nama_web || '-' }}
              </template>
            </Column>
            <Column field="total" header="Total">
              <template #body="slotProps">
                  {{ slotProps.data.total || '-' }}
              </template>
            </Column>
            <Column field="total" header="Total">
              <template #body="slotProps">
                <Button @click="openDialog(slotProps.data)" size="small">
                  <Icon name="lucide:pen"/>
                </Button>
              </template>
            </Column>
          </DataTable>
      </template>
    </Card>

  </div>

   <Dialog v-model:visible="visibleDialog" modal :dismissableMask="true" :header="dataDialog.nama_web || 'Cek Webhost Ganda'" :style="{ width: '80rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <DataTable :value="dataDetail" class="text-sm" :loading="loadingDetail" stripedRows>
      <Column header="#" headerStyle="width:3rem">
        <template #body="slotProps">
            {{ slotProps.index + 1 }}
        </template>
      </Column>
      <Column field="nama_web" header="Nama Web">
        <template #body="slotProps" class="group">            
            <NuxtLink :to="`/webhost/${slotProps.data.id_webhost}`" target="_blank">
              {{ slotProps.data.nama_web || '-' }}              
              <Icon name="lucide:external-link" class="group-hover:opacity-100 opacity-0"/>
            </NuxtLink>
            <div class="text-sm opacity-75">{{ slotProps.data.paket?.paket || '-' }}</div>
        </template>
      </Column>
      <Column field="tgl_mulai" header="Mulai Tgl">
        <template #body="slotProps">
            {{ slotProps.data.tgl_mulai || '-' }}
        </template>
      </Column>
      <Column field="email" header="Kontak">
        <template #body="slotProps">
            {{ slotProps.data.email || '-' }}
            <div class="text-sm opacity-75">{{ slotProps.data.hp || '-' }}</div>
        </template>
      </Column>
      <Column field="cs_main_projects" header="Projects">
        <template #body="slotProps">
            {{ slotProps.data.cs_main_projects.length || '0' }}
        </template>
      </Column>
      <Column field="whmcs_domain" header="WHMCS Domain">
        <template #body="slotProps">
            {{ slotProps.data.whmcs_domain?.expirydate || '-' }}
        </template>
      </Column>
    </DataTable>
  </Dialog>

</template>

<style scoped></style>
