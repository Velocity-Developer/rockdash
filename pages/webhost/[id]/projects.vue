<script setup lang="ts">
definePageMeta({
  title: 'Projects Webhost',
  description: 'Daftar project dari webhost',
})

const route = useRoute()
const id = route.params.id
const client = useSanctumClient()

const { data, status, refresh } = await useAsyncData(
  `webhost-projects-${id}`,
  () => client(`/api/webhost/${id}`)
) as any

const projects = computed(() => {
  const items = data.value?.cs_main_projects
  if (!Array.isArray(items)) {
    return []
  }

  return [...items].sort((a: any, b: any) => {
    return String(b?.tgl_masuk || '').localeCompare(String(a?.tgl_masuk || ''))
  })
})

const totalProjects = computed(() => projects.value.length)

const totalBiaya = computed(() => {
  return projects.value.reduce((acc: number, item: any) => acc + (Number(item?.biaya) || 0), 0)
})

const totalDibayar = computed(() => {
  return projects.value.reduce((acc: number, item: any) => acc + (Number(item?.dibayar) || 0), 0)
})

const visibleDialog = ref(false)
const actionDialog = ref<'add' | 'edit'>('add')
const idDialog = ref<number>(0)
const openDialog = (action: 'add' | 'edit' = 'add', data: any = null) => {
  actionDialog.value = action
  visibleDialog.value = true
  idDialog.value = data?.id || 0
}
</script>

<template>
  <div class="space-y-4">

    <div class="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
      <div class="font-bold text-xl">
       Daftar Projects
      </div>
      <Button size="small" @click="refresh" :loading="status === 'pending'">
        <Icon name="lucide:refresh-ccw" :class="status === 'pending' ? 'animate-spin' : ''" />
        Refresh
      </Button>
    </div>

    <template v-if="data?.id_webhost">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Card>
          <template #content>
            <div class="text-xs uppercase tracking-wide opacity-60">Total Project</div>
            <div class="mt-2 text-xl font-semibold">{{ totalProjects }}</div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="text-xs uppercase tracking-wide opacity-60">Total Biaya</div>
            <div class="mt-2 text-xl font-semibold">{{ formatMoney(totalBiaya) }}</div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="text-xs uppercase tracking-wide opacity-60">Total Dibayar</div>
            <div class="mt-2 text-xl font-semibold">{{ formatMoney(totalDibayar) }}</div>
          </template>
        </Card>
      </div>

      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <Icon name="lucide:briefcase-business" />
            Billing Project
          </div>
        </template>
        <template #content>
          <div v-if="projects.length">
            <DataTable
              :value="projects"
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
                    <Button @click="openDialog('edit', slotProps.data)" size="small">
                      <Icon name="lucide-pen"/>
                    </Button>
                  </div>
                </template>
              </Column>

            </DataTable>
          </div>

          <Message v-else severity="warn">
            Belum ada `cs_main_project` yang terhubung ke webhost ini.
          </Message>
        </template>
      </Card>

      <Card v-if="projects.length">
        <template #title>
          <div class="flex items-center gap-2">
            <Icon name="lucide:chart-no-axes-combined" />
            Grafik Project
          </div>
        </template>
        <template #content>
          <WebhostChartProjects :data="projects" />
        </template>
      </Card>
      
    </template>

    <Message v-else-if="status !== 'pending'" severity="warn">
      Data webhost tidak ditemukan.
    </Message>

    <Dialog v-model:visible="visibleDialog" modal :header="actionDialog=='add'?'Tambah':'Edit'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
      <CsMainProjectFormAdmin :id="idDialog" action="edit" @submit="refresh();visibleDialog = false" />
    </Dialog>

    <DashLoader :loading="status === 'pending'" />
  </div>
</template>
