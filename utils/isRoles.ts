// utils/isRoles.ts
export function isRoles(role: string) {
    const useConfig = useConfigStore()

    //jika role ada dalam array useConfig.config.roles maka return true, jika tidak return false
    if (Array.isArray(useConfig.roles)) {
        return useConfig.roles.includes(role)
    } else {
        // Handle the case where useConfig.config.roles is not an array
        return false
    }
}