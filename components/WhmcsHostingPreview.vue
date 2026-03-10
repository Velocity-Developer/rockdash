<template>
  <div class="space-y-4">
    
    <div class="p-4 rounded border border-grey-400 dark:border-grey-600 text-sm">
        <div class="mb-3 text-emerald-600">
          <Icon name="lucide:circle-user"/> <span class="ml-1 font-bold text-md">User</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
          <div> <span class="font-bold">Name</span> : 
            {{ dataWhmcsHosting?.whmcs_user.firstname }} {{ dataWhmcsHosting?.whmcs_user.lastname }} 
            <NuxtLink v-if="dataWhmcsHosting.whmcs_user" :to="`/whmcs_user/${dataWhmcsHosting.whmcs_user.id}`" target="_blank" class="hover:underline text-blue-500">
              <Icon name="lucide:external-link" />
            </NuxtLink>
          </div> 
          <div> <span class="font-bold">Email</span> : {{ dataWhmcsHosting?.whmcs_user.email }} </div> 
        </div>
    </div>

    <div v-if="dataWhmcsHosting" class="p-4 rounded border border-grey-400 dark:border-grey-600 text-sm">
        <div class="mb-3 text-amber-600">
          <Icon name="lucide:server"/> <span class="ml-1 font-bold text-md">Hostings</span>
        </div>
       
        <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
          <div> <span class="font-bold">Domain</span> : 
            {{ dataWhmcsHosting.domain }} 
            <NuxtLink v-if="dataWhmcsHosting.webhost" :to="`/webhost/${dataWhmcsHosting.webhost.id_webhost}`" target="_blank" class="hover:underline text-blue-500">
              <Icon name="lucide:external-link" />
            </NuxtLink>
          </div> 
          <div> <span class="font-bold">Next Duedate</span> : {{ dataWhmcsHosting.nextduedate }} </div> 
          <div> <span class="font-bold">Billing Cycle</span> : {{ dataWhmcsHosting.billingcycle }} </div> 
          <div> <span class="font-bold">Package Name</span> : {{ dataWhmcsHosting.package_name }} </div> 
          <div> <span class="font-bold">Package Server Type</span> : {{ dataWhmcsHosting.package_servertype }} </div> 
        </div>

    </div>

    <div v-if="dataWhmcsHosting.whmcs_domain" class="p-4 rounded border border-grey-400 dark:border-grey-600 text-sm">
      <div class="mb-3 text-blue-600">
        <Icon name="lucide:globe"/> <span class="ml-1 font-bold text-md">Domains</span>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
        <div> <span class="font-bold">Domain</span> : 
          {{ dataWhmcsHosting.whmcs_domain.domain }}
          <NuxtLink v-if="dataWhmcsHosting.webhost" :to="`/webhost/${dataWhmcsHosting.webhost.id_webhost}`" target="_blank" class="hover:underline text-blue-500">
            <Icon name="lucide:external-link" />
          </NuxtLink>
        </div> 
        <div> <span class="font-bold">Status</span> : {{ dataWhmcsHosting.whmcs_domain.status }} </div> 
        <div> <span class="font-bold">Expiry Date</span> : {{ dataWhmcsHosting.whmcs_domain.expirydate }} </div> 
        <div> <span class="font-bold">Registration Date</span> : {{ dataWhmcsHosting.whmcs_domain.registrationdate }} </div> 
        <div> <span class="font-bold">Type</span> : {{ dataWhmcsHosting.whmcs_domain.type }} </div> 
        <div> <span class="font-bold">Registrar</span> : {{ dataWhmcsHosting.whmcs_domain.registrar }} </div> 
      </div>
      <div v-if="dataWhmcsHosting.webhost" class="border-t py-2 mt-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
          <div> <span class="font-bold">Paket</span> : {{ dataWhmcsHosting.webhost?.paket?.paket }} </div> 
          <div> <span class="font-bold">Email</span> : {{ dataWhmcsHosting.webhost?.email }} </div> 
          <div> <span class="font-bold">Hp</span> : {{ dataWhmcsHosting.webhost?.hp }} </div> 
          <div> <span class="font-bold">Wa</span> : {{ dataWhmcsHosting.webhost?.wa }} </div> 
        </div>
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
const { data: dataWhmcsHosting, status: statusWhmcsHosting, refresh: refreshWhmcsHosting} = await useAsyncData(
    'whmcs_hosting_preview_-'+props.id,
    () => client('/api/whmcs-hosting/'+props.id,{
      params: {
        with: 'whmcs_user,whmcs_domain,webhost,webhost.paket'
      }
    })
) as any
</script>
