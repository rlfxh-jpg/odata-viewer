export const save_data = async (key: string, orginMetadata: any) => {
    await window.electronAPI.saveConfig(key, orginMetadata)
}
export const get_data = async (key: string) => {
    const orginMetadata = await window.electronAPI.getConfig(key)
    return orginMetadata
}