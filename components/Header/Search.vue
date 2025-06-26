<template>

  <form @submit.prevent="handleSubmit" class="flex">
    <InputText v-model="form.search" id="search" type="text" class="w-full" placeholder="Ketik nama web.." required/>
    <div class="text-end">
      <Button type="submit" class="!py-3">
        <Icon v-if="isLoading" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:search" />
      </Button>
    </div>
  </form>

  <div v-if="results && results.length > 0" class="mt-3">

    <div v-for="item in results" class="border-b group border-zinc-100 dark:border-zinc-700">
      <NuxtLink :to="'/webhost/'+item.id_webhost" @click="emit('openlink')">
        <Button variant="text" severity="secondary" class="!text-zinc-700 dark:!text-zinc-100 w-full !justify-between">
          {{ item.nama_web }}
          <Icon name="lucide:arrow-right" class="opacity-25 group-hover:opacity-100 group-hover:translate-x-2 duration-300 ease-in-out"/>
        </Button>
      </NuxtLink>
    </div>

  </div>

</template>

<script setup lang="ts">
const emit = defineEmits(['openlink'])
const client = useSanctumClient();
const isLoading = ref(false)
const toast = useToast();

const form = reactive({
    search: '',
})
const results = ref([] as any)

const handleSubmit = async () => {
  isLoading.value = true;

  //jika search kosong / kurang dari 3 karakter
  if(!form.search || form.search.length < 3){
    toast.add({
        severity: 'warn',
        summary: 'Kesalahan!',
        detail: 'Pencarian harus lebih dari minimal 3 karakter',
        life: 3000
    });
    isLoading.value = false;
    return;
  }

  try {
    const response = await client(`/api/webhost_search/`+form.search) as any
    results.value = response;
  } catch (error: any) {
    toast.add({
        severity: 'warn',
        summary: 'Tidak ditemukan!',
        detail: error?.data?.message,
        life: 3000
    });
  }

  isLoading.value = false;
}
</script>
