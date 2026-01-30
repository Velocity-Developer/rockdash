<template>

  <template v-if="isRoles('webdeveloper')">

    <div class="mb-3">    
      <DashDashboardWelcomeWebdeveloper />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-5 mb-5">
      <div class="col-span-1 md:col-span-3 xl:col-span-4">
        <DashDashboardChartProjectWebdeveloper />
      </div>
      <div class="col-span-1 md:col-span-3 xl:col-span-2">
        <DashDashboardChartProjectWebdeveloperNow />
      </div>
    </div>
    <div class="mb-3">    
      <DashDashboardJurnalWebdeveloper />
    </div>

  </template>
  
  <template v-else-if="isRoles('support')">

    <div class="grid grid-cols-8 gap-3 md:gap-6">

      <div class="col-span-8"> 
        <DashDashboardWelcomeDefault />  
      </div>

      <div class="col-span-8 md:col-span-4 xl:col-span-5">
        <DashDashboardSupportChartJournalDaily /> 
      </div> 

      <div class="col-span-8 md:col-span-4 xl:col-span-3">
        <DashDashboardSupportChartPaket /> 
      </div> 

    </div>

  </template>

  <template v-else-if="isRoles('admin') || isRoles('manager_advertising') || isRoles('manager_project')  || isRoles('customer_service')">
    <div class="flex flex-col md:flex-row gap-5 mb-5">
        <div class="md:basis-[65%]">
          <DashDashboardWelcome />
        </div>
        <div class="md:basis-[35%]">
          <DashDashboardChartLine />
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-5 mb-5">
        <div class="md:basis-[65%]">
          <DashDashboardChartLine2 />
        </div>
        <div class="md:basis-[35%]">
          <DashDashboardChartDoughnut />
        </div>
      </div>
  </template>

  <template v-else>
    
    <DashDashboardWelcomeDefault />      

  </template>
  

  <!-- <div class="flex flex-col md:flex-row gap-5">
    <div class="md:basis-[35%]">
      <DashDashboardChartBar />
    </div>
    <div class="md:basis-[65%]">
      <DashDashboardDataTable />
    </div>
  </div> -->

</template>

<script setup lang="ts">
const useConfig = useConfigStore()
const userRoles = computed(() => useConfig.roles)
</script>