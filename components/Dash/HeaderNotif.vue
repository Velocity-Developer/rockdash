<template>
  <div>
    
    <Button  @click="toggle" variant="text" severity="contrast" class="!px-2 relative">
      <Icon name="lucide:bell"/>

      <div class="absolute top-0 right-0 m-1" v-if="notifikasi.length">
        <span class="relative flex size-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
          <span class="relative inline-flex size-2 rounded-full bg-sky-500"></span>
        </span>
      </div>

    </Button>

    <Drawer v-model:visible="visibleDrawer" :header="'Notifikasi'+' ('+notifikasi.length+')'" position="right">
        
      <ScrollPanel v-if="notifikasi.length" style="width: 100%; height: calc(85vh - 60px);">
        <div v-for="item in notifikasi" :key="item.id" class="border-b border-zinc-100 dark:border-zinc-800">
          <Button @click="markRead(item)" severity="secondary" variant="text" class="flex flex-row !justify-start gap-2 !items-baseline w-full !py-1 text-left">
            <div>
              <Icon name="lucide:mail" size="small" :ssr="true"/>   
            </div>           
            <div class="text-sm">
              <div class="font-bold">New Post</div>
              <div class="truncate w-full block max-w-[17rem]">
                {{ item.data.title }}
              </div>
            </div>
          </Button>
        </div>
      </ScrollPanel>
      <Button v-if="notifikasi.length" @click="markReadAll" severity="info" class="w-full mt-2">
          Mark all as read
      </Button>
      <Message v-else severity="info" size="small">
        Notifications is empty
      </Message>

    </Drawer>

  </div>
</template>

<script setup lang="ts">
const visibleDrawer = ref(false);
const toggle = () => {
    visibleDrawer.value = true
}

interface NotifikasiItem {
  id: number;
  data: {
    title: string;
  };
}

const client = useSanctumClient();
const notifikasi: Ref<NotifikasiItem[]> = ref([]);
const fetchNotifikasi = async () => {
  const data = await client('/api/notifications') as any
  notifikasi.value = data 
}

// Ambil pertama kali
await fetchNotifikasi()

// Ambil ulang setiap 5 menit
setInterval(fetchNotifikasi, 5 * 60 * 1000)

// Mark as read
const markRead = async (data: any) => {
  try {
    await client('/api/notifications/mark-as-read', { 
      method: 'POST',
      params: {
        id: data.id
      }
    })
    //open link
    if(data.data.id){
      navigateTo(`/posts/edit/${data.data.id}`)
    }

    await fetchNotifikasi()
  } catch (error) {
  }
}

//mark all as read
const markReadAll = async () => {
  try {
    await client('/api/notifications/mark-all-as-read', { 
      method: 'POST'
    })
    await fetchNotifikasi()
  } catch (error) {
  }
}
</script>

