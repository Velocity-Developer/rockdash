<template>

  <template v-if="data && data.nama_web">

    <div class="grid grid-cols-12 gap-4 md:gap-6 mb-5">

      <Card class="col-span-12 md:col-span-7 xl:col-span-9">
        <template #content>

          <div class="flex justify-start items-center gap-3 md:mb-10">
            <div>
              <span class="p-3 flex justify-center items-center rounded-lg bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200">
                <Icon name="lucide:globe" class="text-2xl"/>
              </span>
            </div>
            <div>
              <div class="text-lg xl:text-2xl font-bold text-primary-700 dark:text-primary-200">{{ data.nama_web }}</div>
            </div>
          </div>


          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">            
            <div v-for="item in fields_info">
              <div class="mb-1 text-sm opacity-70">
                {{ item.label }}
              </div>
              <div class="py-2 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-700 min-h-[3rem] break-words">
                <template v-if="item.value">
                  {{ item.value }}
                </template>
                <template v-else>
                  {{ data[item.key] || '-'  }}
                </template>
              </div>
            </div>
            <div class="text-end md:pt-5">
              <Button @click="openDialog('edit',data)" severity="info" size="small">
                <Icon name="lucide:pencil" /> <span class="hidden md:inline-block">edit</span>
              </Button>
            </div>
          </div>

        </template>
      </Card>

      <Card v-if="data.whmcs_domain" class="col-span-12 md:col-span-5 xl:col-span-3">
        <template #title>
          <div class="flex items-center gap-2 text-sm text-blue-500">
            <Icon name="lucide:database"/>
            WHMCS Domain
          </div>
        </template>
        <template #content>
          <div>
            <div class="text-sm">Expiry Date</div>
            <div class="font-bold">{{ data.whmcs_domain.expirydate }}</div>
          </div>

          <div class="text-sm mt-2">
            <div>Registration Date</div>
            <div class="font-bold">{{ data.whmcs_domain.registrationdate }}</div>
          </div>

          <div class="text-sm mt-2">
            <div>Status</div>
            <div class="font-bold">{{ data.whmcs_domain.status }}</div>
          </div>
        </template>
      </Card>
      
      
    </div>

    <Menubar :model="itemsMenu" class="mb-5"/>    

    <NuxtPage v-if="$route.matched.length > 1"/>

    <Card v-else>
      <template #title>
        <div class="flex items-center gap-2">
          <Icon name="lucide:briefcase-business" />
          Daftar CS Main Project
        </div>
      </template>
      <template #content>
        <div v-if="dataProjects && dataProjects.data?.cs_main_projects">
          <DataTable
            :value="dataProjects?.data?.cs_main_projects"
            scrollable
            scrollHeight="42rem"
            size="small"
            class="text-xs"
            stripedRows
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
          </DataTable>
        </div>

        <Message v-else severity="warn">
          Belum ada `cs_main_project` yang terhubung ke webhost ini.
        </Message>
      </template>
    </Card>

  </template>

  <template v-else>
    <div class="flex items-center justify-center text-center min-h-[40vh]">      
      <Message severity="warn" class="shadow hover:shadow-md md:px-5 md:py-2">
        <div class="flex items-center justify-center text-center gap-2">   
            <Icon name="lucide:circle-alert"/>
            Data Webhost tidak ditemukan
        </div>
      </Message>
    </div>
  </template>

  <Dialog v-model:visible="visibleDialog" modal :header="actionDialog=='add'?'Tambah':'Edit'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <WebhostForm :action="actionDialog" :id="idDialog" @update="refresh();visibleDialog = false" @delete="refresh();visibleDialog = false" />
  </Dialog>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Data Website',
    description: 'Data Web Klien',
})
const route = useRoute()
const router = useRouter()
const id = route.params.id
const client = useSanctumClient();

const { data, status, error, refresh } = await useAsyncData(
    'webhost-'+id,
    () => client('/api/webhost/'+id,{
      params: {
        with: 'paket,customers,whmcs_domain'
      }
    })
) as any

const fields_info = [
    {key: 'nama_web', label: 'Nama Web', value: data.value?.nama_web || '-' },
    {key: 'kategori', label: 'Kategori', value: data.value?.kategori || '-'  },
    {key: 'paket', label: 'Paket', value: data.value?.paket?.paket || '-' },
    {key: 'tgl_mulai', label: 'Masuk Tanggal'},
    {key: 'saldo', label: 'Saldo'},
    {key: 'hp', label: 'HP'},
    {key: 'telegram', label: 'Telegram'},
    {key: 'hpads', label: 'HP Ads'},
    {key: 'wa', label: 'WA'},
    {key: 'email', label: 'Email'},
    {key: 'waktu', label: 'Chat Pertama', value: data.value?.waktu},
]

const visibleDialog = ref(false)
const actionDialog = ref<'add' | 'edit'>('add')
const idDialog = ref<number>(0)
const openDialog = (action: 'add' | 'edit' = 'add', data: any = null) => {
  actionDialog.value = action
  visibleDialog.value = true
  idDialog.value = data?.id_webhost || 0
}

const itemsMenu = ref([
  {
      label: 'Projects',
      icon: 'lucide:briefcase-business',
      command: () => {
          router.push('/webhost/'+id+'/projects');
      }
  },
  {
      label: 'Subscriptions',
      icon: 'lucide:calendar-sync',
      command: () => {
          router.push('/webhost/'+id+'/subscriptions');
      }
  }
])

const dataProjects = ref({} as any)
onMounted(async () => {
    if(route.matched.length <= 1){
      const result = await useAsyncData(
        `webhost-projects-${id}`,
        () => client(`/api/webhost/${id}`)
      ) as any
      dataProjects.value = result || []
    }
})
</script>
