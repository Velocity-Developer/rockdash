// utils/isPermissions.ts
export function isPermissions(permission: string) {
    const useConfig = useConfigStore()

    //jika role ada dalam array useConfig.config.roles maka return true, jika tidak return false
    if (Array.isArray(useConfig.permissions)) {
        return useConfig.permissions.includes(permission)
    } else {
        // Handle the case where useConfig.config.roles is not an array
        return false
    }
}