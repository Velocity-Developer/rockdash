<template>  
  <Card>
      <template #header>
        <div class="flex justify-between items-center gap-3 px-5 pt-5">
          <div class="flex justify-start items-center gap-3">
            <span class="text-white bg-teal-600 dark:bg-teal-800 h-10 w-10 flex justify-center items-center rounded-lg">
              <Icon name="lucide:server" size="1.5rem"/>
            </span>
            <div>
              <div class="font-bold text-lg md:text-xl">              
                  {{ data?.name }}
              </div>
              <div v-if="data?.hostname" class="text-xs">
                {{ data?.hostname }} | {{ data?.ip_address }}
              </div>
            </div>
          </div>

          <Button size="small" severity="secondary" @click="navigateTo('/servers')">
            <Icon name="lucide:hard-drive"/> List Server
          </Button>

        </div>
      </template>
      <template #content>
        <Tabs :value="route.path">
            <TabList>
                <Tab v-for="tab in items" :key="tab.label" :value="tab.route">
                    <router-link v-if="tab.route" v-slot="{ href, navigate }" :to="tab.route" custom>
                        <a v-ripple :href="href" @click="navigate" class="flex items-center gap-2 text-inherit font-normal">
                            <Icon :name="tab.icon" />
                            <span>{{ tab.label }}</span>
                        </a>
                    </router-link>
                </Tab>
            </TabList>
        </Tabs>
        
        <div class="px-3 py-5">         
          <slot />
        </div>

      </template>
    </Card>

</template>

<script setup lang="ts">
const props = defineProps({
  id : {
    type: Number,
    required: false
  }
})
const client = useSanctumClient()
const route = useRoute()

const emit = defineEmits(['data'])

const { data, refresh } = useAsyncData(
  'data_server_'+props.id, () => client('/api/servers/'+props.id),
) as any

const refreshData = async () => {
  await refresh()

  if (data.value) {
    emit('data', data.value)
  }
}

defineExpose({
  refreshData
})

watch(data, (value) => {
  if (value) {
    emit('data', value)
  }
}, {
  immediate: true
})

const items = ref([
    {
        label: 'Profile',
        route: '/servers/'+props.id,
        icon: 'lucide:info'
    },
    {
        label: 'Packages',
        route: '/servers/'+props.id+'/package',
        icon: 'lucide:package'
    },
    {
        label: 'Users',
        route: '/servers/'+props.id+'/users',
        icon: 'lucide:users'
    }
]);
</script>
