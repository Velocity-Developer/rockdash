<script setup lang="ts">
definePageMeta({
    title: 'Koreksi Webhost',
})
const client = useSanctumClient();
const { start, finish } = useLoadingIndicator()

const filterSubject = ref('ganda' as string)
const filterPage = ref(1 as number)

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { 
      page: filterPage.value || 1,
      subject: filterSubject.value || 'ganda',
     },
  });
}

const onPaginate = (event: { page: number }) => {
    filterPage.value = event.page + 1;
    updateRouteParams()
    refreshData()
};

//get data Webhost Koreksi
const { data: results ,status: statusGet, refresh: refreshData} = await useAsyncData(
    `koreksi-webhost-${filterSubject.value}`,
    async () => {
      start()
      return await client(`/api/dash/koreksi-webhost/${filterSubject.value}?page=${filterPage.value}`,{
        method: 'GET',
        params: {
          page: filterPage.value || 1
        }
      }).finally(finish)
    }
) as any

const dataDetail = ref<any>({})
const loadingDetail = ref(false)
const getDetailWebhost = async (nama_web: string) => {
  loadingDetail.value = true
  try {
    start()
    const res = await client(`/api/dash/koreksi-webhost-data`,{
      method: 'GET',
      params: {
        nama_web: nama_web || ' '
      }
    }) as any
    dataDetail.value = res
  } catch (error) {
    console.log(error)
  } finally {
    loadingDetail.value = false 
    finish()
  }
}

const visibleDialog = ref(false)
const dataDialog = ref<any>({})
const openDialog = (data: any = null) => {
  visibleDialog.value = true
  dataDialog.value = data ? { ...data } : {}
  getDetailWebhost(data.nama_web || '')
}

const dataDetailProject = ref<any>({})
const loadingDetailProject = ref(false)
const getDetailWebhostProject = async (id_webhost: string) => {
  loadingDetailProject.value = true
  try {
    start()
    const res = await client(`/api/webhost/${id_webhost}`) as any
    dataDetailProject.value = res
  } catch (error) {
    console.log(error)
  } finally {
    loadingDetailProject.value = false 
    finish()
  }
}

const visibleDialogProject = ref(false)
const dataDialogProject = ref<any>({})
const openDialogProject = (data: any = null) => {
  visibleDialogProject.value = true
  dataDialogProject.value = data ? { ...data } : {}
  getDetailWebhostProject(data.id_webhost || '')
}

const visibleFormProjects = ref(false)
const idFormProjects = ref<number>(0)
const openFormProjects = (data: any = null) => {
  visibleFormProjects.value = true
  idFormProjects.value = data?.id || 0
}

const idEditWebshost = ref<number>(0)
const visibleEditWebhost = ref(false)
const openEditWebhost = (id: any = null) => {
 idEditWebshost.value = id || 0
 visibleEditWebhost.value = true
}
</script>

<template>
  
  <div class="mx-auto space-y-4 max-w-3xl">

    <div class="flex flex-col md:flex-row justify-end gap-2">
      <div class="text-sm flex justify-between items-center gap-2 shadow hover:shadow-md transition-all duration-300 bg-slate-300 dark:bg-slate-700 rounded-md pl-4 py-1 px-1">
        <label for="filtersubject">Filter Nama Web : </label>
        <SelectButton
          v-model="filterSubject" 
          :options="[
            { name: 'Ganda', value: 'ganda' },
            { name: 'XXX', value: 'xxx' },
            { name: 'Huruf Besar', value: 'uppercase' },
            { name: 'kosong', value: 'kosong' }
          ]" 
          optionLabel="name" 
          optionValue="value" 
          @change="filterPage = 1; refreshData()"
          size="small" name="filtersubject"
        />
      </div>
      <Button @click="refreshData()" size="small" class="shadow hover:shadow-md transition-all duration-300">
        <Icon name="lucide:refresh-cw" :class="statusGet=='pending'?'animate-spin':''"/> Reload
      </Button>
    </div>

    <Card>
      <template #content>
        <DataTable :value="results.data" class="text-sm" :loading="statusGet=='pending'" stripedRows>
          <Column header="#" headerStyle="width:3rem">
            <template #body="slotProps">
                {{ slotProps.index + 1 }}
            </template>
          </Column>
            <Column field="nama_web" header="Nama Web">
              <template #body="slotProps">
                  {{ slotProps.data.nama_web || ' ' }}
              </template>
            </Column>
            <Column v-if="filterSubject == 'ganda'" field="total" header="Total">
              <template #body="slotProps">
                  {{ slotProps.data.total || '0' }}
              </template>
            </Column>
            <Column v-if="filterSubject !== 'ganda'" field="id_webhost" header="ID Webhost">
              <template #body="slotProps">
                  {{ slotProps.data?.id_webhost || '-' }}
              </template>
            </Column>
            <Column field="action" header="Aksi">
              <template #body="slotProps">
                <div class="flex justify-end gap-1">
                  <Button v-if="filterSubject == 'ganda'" @click="openDialog(slotProps.data)" size="small">
                    <Icon name="lucide:pen"/>
                  </Button>
                  <Button v-if="slotProps.data?.id_webhost" @click="openDialogProject(slotProps.data)" severity="info" size="small">
                    <Icon name="lucide:eye"/>
                  </Button>
                </div>
              </template>
            </Column>
          </DataTable>

          <div class="flex justify-between items-center gap-2 mt-4 text-sm">
            <div>
              {{ results.from }}-{{ results.to }} of {{ results.total }}
            </div>
            <Paginator
                :rows="results.per_page"
                :totalRecords="results.total"
                @page="onPaginate"
                :pt="{
                    root: (event: any) => {
                        const itemForPage =  results.per_page;
                        const currentPage =  filterPage - 1;
                        event.state.d_first = itemForPage * currentPage;
                    },
                }"
            >
            </Paginator>
          </div>

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
      <Column field="id_webhost" header="ID">
        <template #body="slotProps">            
            <NuxtLink :to="`/webhost/${slotProps.data.id_webhost}`" class="group" target="_blank">
              {{ slotProps.data.id_webhost || '-' }}              
              <Icon name="lucide:external-link" class="opacity-0 group-hover:opacity-100"/>
            </NuxtLink>
        </template>
      </Column>
      <Column field="nama_web" header="Nama Web">
        <template #body="slotProps">            
            <NuxtLink :to="`/webhost/${slotProps.data.id_webhost}`" class="group" target="_blank">
              {{ slotProps.data.nama_web || '-' }}              
              <Icon name="lucide:external-link" class="opacity-0 group-hover:opacity-100"/>
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
      <Column field="whmcs_domain" header="WHMCS Domain">
        <template #body="slotProps">
            {{ slotProps.data.whmcs_domain?.expirydate || '-' }}
        </template>
      </Column>
      <Column field="cs_main_projects" header="Projects">
        <template #body="slotProps">
          <Button @click="openDialogProject(slotProps.data)" size="small" >
            {{ slotProps.data.cs_main_projects.length || '0' }}
          </Button>
        </template>
      </Column>
      <Column field="action" header="Aksi">
        <template #body="slotProps">          
            <Button @click="openEditWebhost(slotProps.data.id_webhost)" severity="info" size="small">
              <Icon name="lucide:pencil" />
            </Button>
        </template>
      </Column>
    </DataTable>
  </Dialog>

  <Dialog v-model:visible="visibleDialogProject" modal :dismissableMask="true" :header="'Project '+ dataDialogProject.nama_web + ' ('+ dataDialogProject.id_webhost + ')'" :style="{ width: '95rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm bg-amber-50 dark:bg-amber-800 p-4 border border-amber-400 dark:border-amber-700 rounded-md">
      <div>Email : {{ dataDetailProject.email || '-' }}</div>
      <div>HP : {{ dataDetailProject.hp || '-' }}</div>
      <div>WA : {{ dataDetailProject.wa || '-' }}</div>
      <div>Tgl Mulai : {{ dataDetailProject.tgl_mulai || '-' }}</div>
    </div>
    <DataTable
        :value="dataDetailProject.cs_main_projects"
        scrollable
        scrollHeight="42rem"
        size="small"
        class="text-xs"
        stripedRows
        :loading="loadingDetailProject"
      >
        <Column header="#" headerStyle="width:4rem">
          <template #body="slotProps">
            {{ slotProps.index + 1 }}
          </template>
        </Column>
        <Column field="jenis" header="Jenis" />
        <Column field="deskripsi" header="Deskripsi">
          <template #body="slotProps">
            <div class="max-w-[18rem] whitespace-normal break-words">
              {{ slotProps.data.deskripsi || '-' }}
            </div>
          </template>
        </Column>
        <Column field="tgl_masuk" header="Tgl Masuk" />
        <Column field="tgl_deadline" header="Deadline">
          <template #body="slotProps">
            {{ slotProps.data.tgl_deadline || '-' }}
          </template>
        </Column>
        <Column field="status" header="Status">
          <template #body="slotProps">
            <Badge
              :severity="slotProps.data.status === 'selesai' ? 'success' : 'secondary'"
              :value="slotProps.data.status || 'pending'"
            />
          </template>
        </Column>
        <Column field="biaya" header="Biaya">
          <template #body="slotProps">
            {{ formatMoney(slotProps.data.biaya) }}
          </template>
        </Column>
        <Column field="dibayar" header="Dibayar">
          <template #body="slotProps">
            {{ formatMoney(slotProps.data.dibayar) }}
          </template>
        </Column>
        <Column field="lunas" header="Lunas">
          <template #body="slotProps">
            <Badge
              :severity="slotProps.data.lunas === 'lunas' ? 'success' : 'warn'"
              :value="slotProps.data.lunas || 'belum'"
            />
          </template>
        </Column>
        <Column field="wm_project.user.name" header="Webmaster">
          <template #body="slotProps">
            {{ slotProps.data.wm_project?.user?.name || '-' }}
          </template>
        </Column>
        
        <Column field="act" header="" v-if="isPermissions('manage-csmainproject')">
          <template #body="slotProps">
            <div class="flex justify-end">
              <Button @click="openFormProjects(slotProps.data)" size="small">
                <Icon name="lucide-pen"/>
              </Button>
            </div>
          </template>
        </Column>

        <template #empty>
          <div class="text-center text-sm opacity-75">Tidak ada project</div>
        </template>
      </DataTable>
  </Dialog>

  <Dialog v-model:visible="visibleFormProjects" modal header="Edit" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
      <CsMainProjectFormAdmin :id="idFormProjects" action="edit" @submit="getDetailWebhost(dataDetail.nama_web);getDetailWebhostProject(dataDialogProject.id_webhost);visibleFormProjects = false" />
  </Dialog>

  <Dialog v-model:visible="visibleEditWebhost" modal :header="'Edit'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <WebhostForm 
      :action="'edit'" 
      :id="idEditWebshost" 
      @update="getDetailWebhost(dataDetail.nama_web);visibleEditWebhost = false;visibleDialog = false;refreshData()" 
      @delete="getDetailWebhost(dataDetail.nama_web);visibleEditWebhost = false;visibleDialog = false;refreshData()"
    />
  </Dialog>

</template>

<style scoped></style>
