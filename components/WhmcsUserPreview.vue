<template>
  
  <div v-if="statusWhmcsUser !== 'success'" class="flex items-center justify-center h-[300px]">
    <ProgressSpinner style="width: 50px; height: 50px" />
  </div>

  <div class="space-y-4">

      <div class="p-4 rounded border border-grey-400 dark:border-grey-600">
        <div class="mb-3 text-emerald-600">
          <Icon name="lucide:circle-user"/> <span class="ml-1 font-bold text-lg">User</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
          <div> <span class="font-bold">Name</span> : {{ dataWhmcsUser?.firstname }} {{ dataWhmcsUser?.lastname }} </div> 
          <div> <span class="font-bold">Email</span> : {{ dataWhmcsUser?.email }} </div> 
        </div>
      </div>

      <div v-if="dataWhmcsUser.domains && dataWhmcsUser.domains.length > 0" class="p-4 rounded border border-grey-400 dark:border-grey-600">
        <div class="mb-3 text-blue-600">
          <Icon name="lucide:globe"/> <span class="ml-1 font-bold text-lg">Domains</span>
        </div>
       
        <div v-for="item in dataWhmcsUser.domains" :key="item.id" class="grid grid-cols-1 md:grid-cols-2 gap-1">
          <div> <span class="font-bold">Domain</span> : {{ item.domain }} </div> 
          <div> <span class="font-bold">Status</span> : {{ item.status }} </div> 
          <div> <span class="font-bold">Expiry Date</span> : {{ item.expirydate }} </div> 
          <div> <span class="font-bold">Registration Date</span> : {{ item.registrationdate }} </div> 
          <div> <span class="font-bold">Type</span> : {{ item.type }} </div> 
          <div> <span class="font-bold">Registrar</span> : {{ item.registrar }} </div> 
        </div>

      </div>

      <div v-if="dataWhmcsUser.hostings && dataWhmcsUser.hostings.length > 0" class="p-4 rounded border border-grey-400 dark:border-grey-600">
        <div class="mb-3 text-amber-600">
          <Icon name="lucide:server"/> <span class="font-bold text-lg">Hostings</span>
        </div>
       
        <div v-for="item in dataWhmcsUser.hostings" :key="item.id" class="grid grid-cols-1 md:grid-cols-2 gap-1">
          <div> <span class="font-bold">Domain</span> : {{ item.domain }} </div> 
          <div> <span class="font-bold">Next Duedate</span> : {{ item.nextduedate }} </div> 
          <div> <span class="font-bold">Billing Cycle</span> : {{ item.billingcycle }} </div> 
          <div> <span class="font-bold">Package Name</span> : {{ item.package_name }} </div> 
          <div> <span class="font-bold">Package Servertype</span> : {{ item.package_servertype }} </div> 
        </div>

      </div>

  </div>

</template>


<script setup lang="ts">
const toast = useToast()
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

const { data: dataWhmcsUser, status: statusWhmcsUser, refresh: refreshWhmcsUser} = await useAsyncData(
    'whmcs_user_preview_-'+props.id,
    () => client('/api/whmcs-user/'+props.id,{
      params: {
        with: 'domains,hostings'
      }
    })
) as any
</script>
