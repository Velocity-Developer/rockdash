<template>
  
  <div v-for="item in fields" :key="item.key" class="flex flex-col md:flex-row py-2">
    <div class="md:basis-1/4 mb-1">{{ item.label }}</div>
    <div class="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded h-[2rem] w-full">
      
      <template v-if="item.key == 'updated_at'">
        {{ dayjs(data[item.key]).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-else-if="item.key == 'server'">
        {{ data[item.key]?.name }}
      </template>
      <template v-else>
        {{ data[item.key] }}
      </template>

    </div>
  </div>

  <div class="flex justify-end item-center gap-1 mt-4">
    <!-- <Button severity="danger" @click="confirmDelete()" :loading="loading">
      <Icon name="lucide:trash-2"/> Hapus
    </Button> -->
    <Button @click="syncData()" :loading="loading" v-tooltip="'Sinkronkan data dari server'">
      <Icon name="lucide:globe" :class="{ 'animate-spin': loading }"/> Sync
    </Button>
  </div>

</template>

<script setup lang="ts">
const props = defineProps({
  userServer: {
    type: Object,
    required: true,
  },
  server: {
    type: Number,
    required: true,
  }
})
const emit = defineEmits(['update','delete'])
const client = useSanctumClient()
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()

const fields = [
  { key:'username', label: 'UserName'},
  { key:'server', label: 'Server'},
  { key:'package', label: 'Package'},
  // { key:'server_package_id', label: 'Server Package ID'},
  { key:'ns1', label: 'NS1'},
  { key:'ns2', label: 'NS2'},
  { key:'cron', label: 'Cron'},
  { key:'domain', label: 'Domain'},
  { key:'domains', label: 'Domains'},
  { key:'ip', label: 'IP'},
  { key:'lets_encrypt', label: 'Lets Encrypt'},
  { key:'name', label: 'Name'},
  { key:'php', label: 'PHP'},
  { key:'spam', label: 'Spam'},
  { key:'ssh', label: 'SSH'},
  { key:'ssl', label: 'SSL'},
  { key:'suspended', label: 'Suspended'},
  { key:'user_type', label: 'User Type'},
  { key:'users', label: 'Users'},
  { key:'wordpress', label: 'Wordpress'},
  { key:'updated_at', label: 'Last Update'},
]

const loading = ref(false)
const data = ref({} as any)
const getData = async () => {
  loading.value = true
  try {
    loading.value = true
    const res = await client('/api/server_users/'+props.userServer.id)
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

const syncData = async () => {
  loading.value = true
  try {
    loading.value = true
    const res = await client('/api/servers_sync_user_detail/'+props.userServer.id)
    loading.value = false
    data.value = res
    emit('update')
  } catch (error) {
    const er = useSanctumError(error)
    loading.value = false
  }
}
</script>
