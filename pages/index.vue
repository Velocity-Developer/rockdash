<template>

  <template v-if="isRoles('webdeveloper')">

    <div class="mb-3">    
      <DashDashboardWelcomeWebdeveloper />
    </div>
    <div class="mb-3">    
      <DashDashboardChartProjectWebdeveloper />
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