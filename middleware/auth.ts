export default defineNuxtRouteMiddleware((to, from) => {
    const config = useConfigStore()

    const metaPermission = to.meta.permission;

    // Cek permissions
    if (metaPermission && !config.permissions.includes(metaPermission)) {
        return navigateTo('/403') // halaman tidak punya akses
    }
    
})
