<template>
  <div>
    Page: users/index
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Users',
})
const route = useRoute();
const page = ref(route.query.page ? Number(route.query.page) : 1);
const client = useSanctumClient();


</script>

