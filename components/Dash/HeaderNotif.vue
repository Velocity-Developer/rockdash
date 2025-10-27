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

  <div class="flex justify-center items-center fixed z-[99] top-0 bottom-0 end-0 start-0 bg-white/30 backdrop-blur-sm">
    <div class="bg-gray-950 border border-red-500 text-center text-white p-4 rounded-md shadow-md w-[300px] md:w-[400px]">
      <div class="flex justify-center items-center mb-5">
        <Icon name="lucide:server-off" class="w-20 h-20" :ssr="true"/>
      </div>
      Gagal menyambung ke server !. <br> Silahkan coba lagi...
      <div class="bg-gray-800 p-3 text-left rounded-md mt-4">
        <ul class="list-decimal pl-4">
          <li>Periksa koneksi internet</li>
          <li>Periksa apakah IP di block</li>
        </ul>
      </div>
      <span class="bg-gray-800 p-3 mt-2 rounded-md flex justify-start items-center gap-1" v-tooltip="`IP Address: ${userIP}`">
        <Icon name="lucide:globe" />
        <span>IP: {{ userIP || 'Loading...' }}</span>
      </span>
      <Button @click="fetchNotifikasi" severity="danger" class="w-full mt-5">
        Coba lagi
      </Button>
    </div>      
    <ProgressBar v-if="isLoading" mode="indeterminate" style="height: 6px"></ProgressBar>
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

const userIP = ref('')
const isError = ref(false)
const isLoading = ref(false)
const client = useSanctumClient();
const notifikasi: Ref<NotifikasiItem[]> = ref([]);
const fetchNotifikasi = async () => {
  isLoading.value = true
  try {
    const data = await client('/api/notifications') as any
    notifikasi.value = data 
    isError.value = false
  } catch (error) {
    console.log(error)
    isError.value = true
    fetchUserIP()
  }
  isLoading.value = false
}

// Ambil pertama kali, setelah 20 detik
setTimeout(() => {
  fetchNotifikasi()
}, 20000)

// Ambil ulang setiap 5 menit
setInterval(fetchNotifikasi, 5 * 60 * 1000)

// Function to fetch user IP
const fetchUserIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    userIP.value = data.ip
  } catch (error) {
    console.error('Failed to fetch IP:', error)
    userIP.value = 'Unknown'
  }
}

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

