<template>
  <div v-if="taxonomy" class="bg-emerald-50 p-3 md:p-5 rounded-lg mb-3 md:mb-5">
      <h1 class="text-lg md:text-2xl font-medium text-zinc-700 capitalize">
          {{ taxonomy }}
      </h1>
      <div class="text-sm text-zinc-400">
        Terms posts
      </div>
    </div>
    
  <div>
    <DataTable v-if="data" :value="data.data" v-model:selection="selectedPosts" size="small" stripedRows scrollable>
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column field="name" header="Name"/>
      <Column field="slug" header="Slug"/>
      <Column field="description" header="Description"/>
    </DataTable>
  </div>

</template>

<script setup lang="ts">
const route = useRoute()
const taxonomy = computed(() => route.params.taxonomy)

const toast = useToast();
const page = ref(route.query.page ? Number(route.query.page) : 1);
const client = useSanctumClient();
const { data, status, error, refresh } = await useAsyncData(
    'terms-page-'+page.value,
    () => client('/api/terms',{
        params: {
            page: page.value,
            taxonomy: taxonomy.value,
        }
    })
)
const selectedPosts = ref();

</script>