<template>
  <Card class="md:h-[100%] dark:bg-zinc-800">
    <template #content>
      
      <div>
        <div class="dark:text-zinc-400">Post terbaru</div>
      </div>

      <DataTable v-if="data" :value="data.data" size="small" stripedRows scrollable>
        <Column field="title" header="Title">
          <template #body="slotProps">
            <div class="flex">
              <img class="aspect-square object-cover w-8" :src="slotProps.data?.featured_image_url" :alt="slotProps.data?.title" />
              <div class="ms-2 text-xs truncate">
                <nuxtLink :to="'/posts/edit/'+slotProps.data.id">{{ slotProps.data?.title }}</nuxtLink>
              </div>
            </div>
          </template>
        </Column>
        <Column field="author" header="Author" class="text-xs">
          <template #body="slotProps">
            {{ slotProps.data?.author?.name }}
          </template>
        </Column>
        <Column field="date" header="Date">
          <template #body="slotProps">
            <span class="text-xs"> {{ slotProps.data?.date }} </span>
          </template>
        </Column>
      </DataTable>

    </template>
  </Card>
</template>

<script setup lang="ts">
const client = useSanctumClient();
const { data, status, error, refresh } = await useAsyncData(
    'dashboard-datatable',
    () => client('/api/dashboard/datatable')
)
</script>