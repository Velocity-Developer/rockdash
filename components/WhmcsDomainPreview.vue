<template>
  <div class="space-y-4">
    
    <div class="p-4 rounded border border-grey-400 dark:border-grey-600 text-sm">
        <div class="mb-3 text-emerald-600">
          <Icon name="lucide:circle-user"/> <span class="ml-1 font-bold text-md">User</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
          <div> <span class="font-bold">Name</span> : 
            {{ dataWhmcsDomain?.whmcs_user.firstname }} {{ dataWhmcsDomain?.whmcs_user.lastname }} 
            <NuxtLink v-if="dataWhmcsDomain.whmcs_user" :to="`/whmcs_user/${dataWhmcsDomain.whmcs_user.id}`" target="_blank" class="hover:underline text-blue-500">
              <Icon name="lucide:external-link" />
            </NuxtLink>
          </div> 
          <div> <span class="font-bold">Email</span> : {{ dataWhmcsDomain?.whmcs_user.email }} </div> 
        </div>
    </div>

    <div v-if="dataWhmcsDomain" class="p-4 rounded border border-grey-400 dark:border-grey-600 text-sm">
      <div class="mb-3 text-blue-600">
        <Icon name="lucide:globe"/> <span class="ml-1 font-bold text-md">Domains</span>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
        <div> <span class="font-bold">Domain</span> : 
          {{ dataWhmcsDomain.domain }}
          <NuxtLink v-if="dataWhmcsDomain.webhost" :to="`/webhost/${dataWhmcsDomain.webhost.id_webhost}`" target="_blank" class="hover:underline text-blue-500">
            <Icon name="lucide:external-link" />
          </NuxtLink>
        </div> 
        <div> <span class="font-bold">Status</span> : {{ dataWhmcsDomain.status }} </div> 
        <div> <span class="font-bold">Expiry Date</span> : {{ dataWhmcsDomain.expirydate }} </div> 
        <div> <span class="font-bold">Registration Date</span> : {{ dataWhmcsDomain.registrationdate }} </div> 
        <div> <span class="font-bold">Type</span> : {{ dataWhmcsDomain.type }} </div> 
        <div> <span class="font-bold">Registrar</span> : {{ dataWhmcsDomain.registrar }} </div> 
      </div>
      <div v-if="dataWhmcsDomain.webhost" class="border-t py-2 mt-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
          <div> <span class="font-bold">Paket</span> : {{ dataWhmcsDomain.webhost?.paket?.paket }} </div> 
          <div> <span class="font-bold">Email</span> : {{ dataWhmcsDomain.webhost?.email }} </div> 
          <div> <span class="font-bold">Hp</span> : {{ dataWhmcsDomain.webhost?.hp }} </div> 
          <div> <span class="font-bold">Wa</span> : {{ dataWhmcsDomain.webhost?.wa }} </div> 
        </div>
      </div>

    </div>

    <div v-if="dataWhmcsDomain.hosting" class="p-4 rounded border border-grey-400 dark:border-grey-600 text-sm">
        <div class="mb-3 text-amber-600">
          <Icon name="lucide:server"/> <span class="ml-1 font-bold text-md">Hostings</span>
        </div>
       
        <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
          <div> <span class="font-bold">Domain</span> : 
            {{ dataWhmcsDomain.hosting.domain }} 
            <NuxtLink v-if="dataWhmcsDomain.webhost" :to="`/webhost/${dataWhmcsDomain.webhost.id_webhost}`" target="_blank" class="hover:underline text-blue-500">
              <Icon name="lucide:external-link" />
            </NuxtLink>
          </div> 
          <div> <span class="font-bold">Next Duedate</span> : {{ dataWhmcsDomain.hosting.nextduedate }} </div> 
          <div> <span class="font-bold">Billing Cycle</span> : {{ dataWhmcsDomain.hosting.billingcycle }} </div> 
          <div> <span class="font-bold">Package Name</span> : {{ dataWhmcsDomain.hosting.package_name }} </div> 
          <div> <span class="font-bold">Package Servertype</span> : {{ dataWhmcsDomain.hosting.package_servertype }} </div> 
        </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const client = useSanctumClient();
const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
  action: {
    type: String,
    default: 'add',
  },
})

const { data: dataWhmcsDomain, status: statusWhmcsDomain, refresh: refreshWhmcsDomain} = await useAsyncData(
    'whmcs_domain_preview_-'+props.id,
    () => client('/api/whmcs-domain/'+props.id,{
      params: {
        with: 'whmcs_user,hosting,webhost,webhost.paket'
      }
    })
) as any
</script>
