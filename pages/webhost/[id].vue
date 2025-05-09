<template>

  <div class="text-lg md:text-xl font-bold bg-primary-500 dark:bg-primary-900 text-white p-4 md:px-6 break-all rounded-xl mb-4">
    {{ data.nama_web }}
  </div>

  <div class="overflow-x-auto mb-8">
    <div class="flex gap-4 items-center">
      
      <Card class="w-[20rem] min-w-[200px] min-h-[5rem] !shadow-none bg-yellow-50 dark:bg-zinc-700 border border-zinc-100 dark:border-zinc-800">
        <template #content>
          <div class="mb-2 text-sm flex items-center gap-2 text-primary-700 dark:text-primary-200">
            <Icon name="lucide:briefcase"/> Total Projects
          </div>
          <div class="text-end text-xl font-bold">
            {{ totalProjects }}
          </div>
        </template>
      </Card>

      <Card class="w-[20rem] min-w-[200px] min-h-[5rem] !shadow-none border border-zinc-100 dark:border-zinc-800 bg-yellow-50 dark:bg-zinc-700">
        <template #content>
          <div class="mb-2 text-sm flex items-center gap-2 text-primary-700 dark:text-primary-200">
            <Icon name="lucide:wallet"/> Total Biaya
          </div>
          <div class="text-end text-xl font-bold">
            {{ formatMoney(totalBiaya) }}
          </div>
        </template>
      </Card>

      <Card class="w-[20rem] min-w-[200px] min-h-[5rem] !shadow-none border border-zinc-100 dark:border-zinc-800 bg-yellow-50 dark:bg-zinc-700">
        <template #content>
          <div class="mb-2 text-sm flex items-center gap-2 text-primary-700 dark:text-primary-200">
            <Icon name="lucide:mail"/> Email
          </div>
          <div class="text-end text-xl font-bold">
            {{ data.email }}
          </div>
        </template>
      </Card>

      <Card class="w-[20rem] min-w-[200px] min-h-[5rem] !shadow-none border border-zinc-100 dark:border-zinc-800 bg-yellow-50 dark:bg-zinc-700">
        <template #content>
          <div class="mb-2 text-sm flex items-center gap-2 text-primary-700 dark:text-primary-200">
            <Icon name="lucide:message-circle"/> WhatsApp
          </div>
          <div class="text-end text-xl font-bold">
            {{ data.wa }}
          </div>
        </template>
      </Card>
    </div>
</div>
  
  <div class="flex flex-col md:flex-row gap-4">

    <div class="md:basis-[30rem]">
      <Card class="border border-zinc-100 dark:border-zinc-800">
        <template #title>
          <div class="flex items-center gap-2">
            <Icon name="lucide:info" />
            Informasi
          </div>
        </template>
        <template #content>

          <div v-for="item in fields_info" class="mb-3">
            <div class="mb-1 text-sm opacity-70">
              {{ item.label }}
            </div>
            <div class="py-2 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-700 min-h-[2rem]">
              <template v-if="item.value">
                {{ item.value }}
              </template>
              <template v-else>
                {{ data[item.key] }}
              </template>
            </div>
          </div>

        </template>
      </Card>
    </div>

    <div class="md:flex-1">     
      <Card class="border border-zinc-100 dark:border-zinc-800">
        <template #title>
          <div class="flex items-center gap-2">
            <Icon name="lucide:briefcase" />
            Projects
          </div>
        </template>
        <template #content>

          <div v-if="data.cs_main_projects">
            <DataTable :value="data.cs_main_projects" scrollable scrollHeight="42rem" size="small" class="text-xs" stripedRows>
              <Column field="jenis" header="Jenis"></Column>
              <Column field="tgl_masuk" header="Mulai Tanggal"></Column>
              <Column field="status" header="Status">
                <template #body="slotProps">
                  <Badge v-if="slotProps.data.status == 'selesai'" severity="success" :value="slotProps.data.status"></Badge>
                  <Badge v-else severity="secondary" :value="slotProps.data.status"></Badge>
                </template>
              </Column>
              <Column field="biaya" header="Total Biaya">
                <template #body="slotProps">
                    {{ formatMoney(slotProps.data.biaya) }}
                </template>
              </Column>
              <Column field="dibayar" header="dibayar">
                <template #body="slotProps">
                    {{ formatMoney(slotProps.data.dibayar) }}
                </template>
              </Column>
            </DataTable>
          </div>

        </template>
      </Card>
    </div>

  </div>

  <Card class="border border-zinc-100 dark:border-zinc-800 mt-6">
    <template #title>
      <div class="flex items-center gap-2">
        <Icon name="lucide:chart-no-axes-combined" />
        Grafik Projects
      </div>
    </template>
    <template #content>
      <WebhostChartProjects :data="data.cs_main_projects"/>
    </template>
  </Card>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Data Website',
    description: 'Data Web Klien',
})
const route = useRoute()
const id = route.params.id
const client = useSanctumClient();

const { data, status, error, refresh } = await useAsyncData(
    'webhost-'+id,
    () => client('/api/webhost/'+id)
)

const fields_info = [
    {key: 'nama_web', label: 'Nama Web', value: data.value.nama_web},
    {key: 'paket', label: 'Paket', value: data.value.paket?.paket},
    {key: 'tgl_mulai', label: 'Masuk Tanggal'},
    {key: 'saldo', label: 'Saldo'},
    {key: 'hp', label: 'HP'},
    {key: 'telegram', label: 'Telegram'},
    {key: 'hpads', label: 'HP Ads'},
    {key: 'wa', label: 'WA'},
    {key: 'email', label: 'Email'},
]

//hitung total dari data.cs_main_projects
const totalBiaya = computed(() => {
    if(data.value.cs_main_projects){
        return data.value.cs_main_projects.reduce((acc: any, item: any) => {
            return acc + item.biaya
        }, 0)
    }
})

//hitung total projects dari data.cs_main_projects
const totalProjects = computed(() => {
    if(data.value.cs_main_projects){
        return data.value.cs_main_projects.length
    }
})
</script>
