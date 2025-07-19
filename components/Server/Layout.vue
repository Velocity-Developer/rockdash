<template>
  <div class="flex flex-col md:flex-row gap-5">

    <Card class="md:basis-[10em] md:min-h-[80vh] !bg-sky-50 dark:!bg-sky-800 md:pb-50 overflow-hidden relative">
      <template #content>
        <div>
          <div class="font-bold text-lg md:text-xl mb-4 md:text-center min-h-[2em]">              
              {{ data.name }}
          </div>

          <Menu
          :model="items"
          :pt="{
              root: () => ({
                  class: [
                      '!border-none',
                      '!bg-transparent',
                      '!min-w-[1rem]'
                  ]
              }),
              item: () => ({
                  class: [
                      '!rounded-lg',
                      '!bg-white dark:!bg-zinc-800',
                      'mb-1 overflow-hidden',
                  ]
              }),
          }"
          >
            <template #item="{ item, props }">
                <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" :class="{ 'bg-sky-200 dark:bg-sky-700': route.path == item.route }" custom>
                    <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                        <span>{{ item.label }}</span>
                    </a>
                </router-link>
                <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                    <span>{{ item.label }}</span>
                </a>
            </template>
          </Menu>

        </div>
        <div class="absolute bottom-[-1em] right-[-1em] z-[1] opacity-10">
          <Icon name="lucide:server" size="8rem" class="text-sky-600"/>
        </div>
      </template>
    </Card>

    <Card class="md:flex-1">
      <template #content>
        <slot />
      </template>
    </Card>

  </div>
  
  

</template>

<script setup lang="ts">
const props = defineProps({
  id : {
    type: Number,
    required: false
  }
})
const emit = defineEmits(['data'])
const client = useSanctumClient()
const route = useRoute()

const loading = ref(false)
const data = ref({} as any)
const getData = async () => {
  loading.value = true
  try {
    const res = await client('/api/servers/'+props.id)
    loading.value = false
    data.value = res
    emit('data', res)
  } catch (error) {
    const er = useSanctumError(error)
    loading.value = false
  }
}
onMounted(() => {
  getData()
})

const items = ref([
    {
        label: 'Profile',
        route: '/servers/'+props.id,
    },
    {
        label: 'Packages',
        route: '/servers/'+props.id+'/package'
    },
    {
        label: 'Users',
        route: '/servers/'+props.id+'/users'
    }
]);
</script>
