<template>
  <div class="w-full space-y-4">

    <Card>
      <template #content>
        <div v-if="data">

          <div class="flex flex-col md:flex-row gap-2 items-start justify-between text-sm">
            <div class="space-y-2">
              <h2 class="text-lg font-bold mb-3">{{ data.nama }}</h2>              
              <div class="flex items-center gap-2">
                <Icon name="lucide:mail" /> {{ data.email || '-' }}
              </div>
              <div class="flex items-center gap-2">
                <Icon name="lucide:phone" /> {{ data.hp || '-' }}
              </div>
              <div class="flex items-center gap-2">
                <Icon name="lucide:map-pin" /> {{ data.alamat || '-' }}
              </div>
            </div>
            <div>
              <Button asChild v-slot="slotProps" severity="info" size="small">                
                <RouterLink :to="'/customer/'+data.id+'?tab=setting'" :class="slotProps.class">
                  <Icon name="lucide:pencil" /> Edit
                </RouterLink>
              </Button>
            </div>
          </div>

        </div>
        
        <div v-else-if="pending" class="flex justify-center items-center h-64">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Loading" />
        </div>
        
        <div v-else-if="error" class="flex justify-center items-center h-64">
          <Message severity="error">
            Terjadi kesalahan saat memuat data customer
          </Message>
        </div>
      </template>
    </Card>

    <Tabs class="mb-3 !bg-transparent !rounded" :value="tab">
        <TabList class="!bg-transparent !rounded">
            <Tab v-for="tab in items" :key="tab.label" :value="tab.route" class="py-3">
                <router-link v-if="tab.route" v-slot="{ href, navigate }" :to="tab.route" custom>
                    <a v-ripple :href="href" @click="navigate" class="flex items-center gap-1 font-normal text-sm">
                      <Icon :name="'lucide:'+tab.icon"/>
                      <span>{{ tab.label }}</span>
                    </a>
                </router-link>
            </Tab>
        </TabList>
    </Tabs>

    <template v-if="customer_id">
      <CustomerTableInvoice v-if="tab == 'invoice'" :customerId="customer_id"/>
      <CustomerTabSettings v-else-if="tab == 'setting'" :customerId="customer_id"/>
    </template>

    <DashLoader :loading="isLoadingDash"/>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Detail Customer',
  description: 'Detail Informasi Customer',
})

const route = useRoute();
const client = useSanctumClient();
const customer_id = computed(() => route.params.id) as any
const tab = computed(() => route.query.tab || 'invoice') as any

const { data, pending, error, refresh } = await useAsyncData(
  `customer-${route.params.id}`,
  () => client(`/api/customer/${route.params.id}`)
) as any

//watch status
const isLoadingDash = ref(false)
watch(pending, (newValue, oldValue) => {
  if(newValue == false) {
    isLoadingDash.value = false;
  } else {
    isLoadingDash.value = true;
  }
})

const items = ref([
    { route: '/customer/' + customer_id.value+'?tab=invoice', label: 'Invoice', icon: 'file-text' },
    { route: '/customer/' + customer_id.value+'?tab=setting', label: 'Pengaturan', icon: 'settings' },
]);
</script>