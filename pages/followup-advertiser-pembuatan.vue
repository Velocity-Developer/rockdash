<script setup lang="ts">
definePageMeta({
    title: 'Followup Advertiser Pembuatan',
    description: 'Daftar Followup Advertiser Pembuatan',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const filters = reactive({
  page: route.query.page ? Number(route.query.page) : 1,
  per_page: 20,
  order_by: 'tgl_masuk',
  order: 'desc',
}) as any

const loading = ref(false);
const data = ref({} as any);

const getData = async () => {
    loading.value = true;

    const query = { ...filters }
    if (query.page === 1) delete query.page
    
    router.push({ query })

    try {
      const res = await client('/api/followup-advertiser',{
        params: filters,
      }) as any
      data.value = res;
    } catch (er) {
      console.log(er);
      const error = useSanctumError(er);
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Data gagal diambil'+ error.bag,
        life: 3000
      });
    }
    loading.value = false;
}

const onPaginate = (event: { page: number }) => {
    filters.page = event.page + 1;
    getData()
};

const itemChanged = ref(null) as any
const loadingStatusChange = ref(false)
const onStatusChange = async (item: object,index: Number) => {
    // console.log('Item berubah:', item)
    itemChanged.value = index

    const idFollowupAdvertiser = (item as any)?.webhost?.followup_advertiser?.id || null;
    loadingStatusChange.value = true
    try {
      const res = await client(idFollowupAdvertiser?'/api/followup-advertiser/'+idFollowupAdvertiser:'/api/followup-advertiser',{
        method : idFollowupAdvertiser?'PUT':'POST',
        body: {
          id_webhost_ads: (item as any)?.id_webhost,
          status_ads: (item as any)?.webhost.followup_advertiser.status_ads,
          update_ads: dayjs().local().format('YYYY-MM-DD HH:mm:ss')
        },
      }) as any      
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Status berhasil diubah',
        life: 3000
      });
    } catch (er) {      
      console.log(er);
      const error = useSanctumError(er);
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Status gagal diubah, '+ error.bag,
        life: 3000
      });
    } finally {
      loadingStatusChange.value = false
      itemChanged.value = null
    }
}

onMounted(() => {
  getData();
});

const { data: dataAnalytics, status: statusAnalytics, refresh: refreshAnalytics } = await useAsyncData(
  'followup_advertiser_analytics',
  (_nuxtApp, { signal }) => client('/api/followup_advertiser_analytics', { signal }),
) as any
</script>

<template>
  <div class="flex justify-end items-center mb-2">
    <Button @click="getData();refreshAnalytics()" size="small" :loading="loading" severity="info">
      <Icon name="lucide:refresh-ccw" :class="{ 'animate-spin': loading }" />
      Refresh
    </Button>
  </div>

  <div v-if="dataAnalytics && dataAnalytics.status" class="overflow-x-auto mb-4 py-1">
    <div v-if="statusAnalytics !== 'pending'" class="flex items-start gap-2">
      <Card class="min-w-[150px]">
        <template #content>
          <div class="opacity-75 text-sm mb-1">Ringkasan status :</div>
          <div class="font-bold">{{ dataAnalytics.bulan }}</div>
        </template>
      </Card>
      <Card  class="min-w-[150px]">
        <template #content>
          <div class="opacity-75 text-sm mb-1">Blm di Followup</div>
          <div class="font-bold text-right">{{ dataAnalytics.blm_followup }}</div>
        </template>
      </Card>
      <Card v-for="(d,i) in dataAnalytics.status" class="min-w-[150px]">
        <template #content>
          <div class="opacity-75 text-sm mb-1">{{ i }}</div>
          <div class="font-bold text-right">{{ d }}</div>
        </template>
      </Card>
    </div>

    <div v-if="statusAnalytics == 'pending'" class="flex items-start gap-2">
      <Skeleton v-for="i in 6" height="5rem" width="152px"/>
    </div>

  </div>

  <Card class="shadow mt-4">
    <template #content>
      <DataTable :value="data.data" :loading="loading" stripedRows responsiveLayout="scroll" size="small" class="text-sm">
        <Column field="no" header="No" style="width: 50px">
          <template #body="slotProps">
            {{ data.from + slotProps.index }}
          </template>
        </Column>
        <Column field="tgl_masuk" header="Tgl order" />
        <Column field="webhost.wa" header="WhatsApp"/>
        <Column field="webhost.paket.paket" header="Paket">
          <template #body="slotProps">
            {{ slotProps.data.webhost?.paket?.paket }}
            <div class="text-xs text-emerald-600">{{ slotProps.data?.jenis }}</div>
          </template>
        </Column>
        <Column field="webhost.nama_web" header="Nama Domain"/>
         <Column field="status" header="Status">
          <template #body="slotProps">
            <div 
              class="flex items-center justify-start gap-1" 
              v-tooltip.top="slotProps.data.webhost.followup_advertiser?.update_ads ? slotProps.data.webhost.followup_advertiser.status_ads+' : '+slotProps.data.webhost.followup_advertiser?.update_ads:''"
            >

              <template v-if="loadingStatusChange && itemChanged === slotProps.index">  
                  <span class="p-2 w-8 h-8 text-sm flex items-center justify-center rounded-xl text-white bg-zinc-400">              
                    <Icon name="lucide:loader-circle" class="animate-spin" width="2rem" /> 
                  </span>
              </template>
                <template v-else>
                  <template v-if="slotProps.data.webhost.followup_advertiser.status_ads === 'Sudah difollowup'">
                    <span class="p-2 w-8 h-8 text-sm flex items-center justify-center rounded-xl text-white bg-green-600">
                      <Icon name="lucide:check-check" width="2rem" />  
                    </span>
                  </template>
                  <template v-else-if="slotProps.data.webhost.followup_advertiser.status_ads === 'Sudah iklan'">
                    <span class="p-2 w-8 h-8 text-sm flex items-center justify-center rounded-xl text-white bg-blue-600">
                    <Icon name="lucide:laptop-minimal-check" width="2rem" />  
                    </span>
                  </template>
                  <template v-else-if="slotProps.data.webhost.followup_advertiser.status_ads === 'Tidak'">
                    <span class="p-2 w-8 h-8 text-sm flex items-center justify-center rounded-xl text-white bg-red-600">
                    <Icon name="lucide:x" width="2rem" />  
                    </span>
                  </template>
                  <template v-else>
                    <span class="p-2 w-8 h-8 text-sm flex items-center justify-center rounded-xl text-white bg-zinc-400">
                    <Icon name="lucide:circle-question-mark" width="2rem" />  
                    </span>
                  </template>
              </template>

              <Select 
              size="small" 
              :options="['-', 'Tidak', 'Sudah difollowup', 'Sudah iklan']" 
              v-model="slotProps.data.webhost.followup_advertiser.status_ads" 
              @change="onStatusChange(slotProps.data,slotProps.index)"
              :loading="loadingStatusChange && itemChanged === slotProps.index"
              :disabled="loadingStatusChange"
              />
            </div>
          </template>
        </Column>
        
        <template #empty>
          <div class="flex justify-center p-4">
            Tidak ada data ditemukan.
          </div>
        </template>
      </DataTable>

      <div v-if="data.total > 0" class="flex flex-col md:flex-row justify-center md:justify-between md:items-center text-xs mt-4">
        <div>
          {{ data.from }} - {{ data.to }} dari {{ data.total }}
        </div>

        <Paginator
          :rows="data.per_page"
          :totalRecords="data.total"
          @page="onPaginate"
          :pt="{
            root: (event: any) => {
              const itemForPage = data.per_page;
              const currentPage = filters.page - 1;
              event.state.d_first = itemForPage * currentPage;
            },
          }"
        >
        </Paginator>
      </div>
    </template>
  </Card>

  <DashLoader :loading="loading"/>
</template>

<style scoped></style>
