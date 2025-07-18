<template>
  
  <ServerLayout :id="id" @data="getServers($event)">
    <div class="mb-5">
      <h1 class="text-xl">Profil : {{ dataServer.name }}</h1>
    </div>
    <ServerForm :action="'edit'" :data="dataServer"/>
  </ServerLayout>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Servers',
})
const client = useSanctumClient()

const route = useRoute()
const id = Number(route.params.id) || 0

const dataServer = ref({} as any)
const getServers = (data: any) => {
  dataServer.value = data
}
</script>
