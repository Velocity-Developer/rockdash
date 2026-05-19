<template>
  
  <ServerLayout :id="id" @data="getServers($event)" ref="layoutRef">
    <div class="max-w-3xl mx-auto md:py-10">
      <ServerForm :action="'edit'" :data="dataServer" @update="updateLayout()"/>
    </div>
  </ServerLayout>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Profil Server',
})
const route = useRoute()
const id = Number(route.params.id) || 0

const dataServer = ref({} as any)
const getServers = (data: any) => {
  dataServer.value = data
}

import ServerLayout from '~/components/Server/Layout.vue'
type ServerLayoutExpose = {
  refreshData: () => Promise<void> | void
}

const layoutRef = ref<ServerLayoutExpose | null>(null)
const updateLayout = async () => {
  await layoutRef.value?.refreshData()
}
</script>
