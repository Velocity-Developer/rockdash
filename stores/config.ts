import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {

    const openSidebar = ref(false)
    function toggelOpenSidebar() {
        openSidebar.value = !openSidebar.value
    }

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
        bg_welcome: '',
        user: {
            avatar_url: '',
            name: '',
            id: '',
        },
        permissions: []
    })
    const permissions = ref([] as any)
    
    const setConfig = (setvalue: { year: number; app_name: string; app_description: string; app_logo: string; app_logo_small: string; app_favicon: string; bg_welcome: string; user: { avatar_url: string; name: string; id: string }; permissions: never[] } | { year: number; app_name: string; app_description: string; app_logo: string; app_logo_small: string; app_favicon: string; bg_welcome: string; user: { avatar_url: string; name: string; id: string }; permissions: never[] }) => {
        config.value = setvalue
        permissions.value = config.value.permissions
    }

    return {
        openSidebar,
        toggelOpenSidebar,
        miniSidebar,
        toggelMiniSidebar,
        config,
        setConfig,
        permissions
    }
})