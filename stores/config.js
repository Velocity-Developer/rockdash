import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {

    const miniSidebar = ref(false)
    function toggelMiniSidebar() {
        miniSidebar.value = !miniSidebar.value
    }

    const config = ref({
        year: new Date().getFullYear(),
        app_name: '',
        app_description: '',
        app_logo: '',
        app_logo_small: '',
        app_favicon: '',
    })
    const setConfig = (setvalue) => {
        config.value = setvalue
    }

    return {
        miniSidebar,
        toggelMiniSidebar,
        config,
        setConfig
    }
})