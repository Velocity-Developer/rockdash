import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {

    const miniSidebar = ref(false)
    function toggelMiniSidebar() {
        miniSidebar.value = !miniSidebar.value
    }

    return {
        miniSidebar,
        toggelMiniSidebar
    }
})