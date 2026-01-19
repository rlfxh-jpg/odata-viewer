import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const saveOrginMetadata = async (orginMetadata: any) => {
  await window.electronAPI.saveConfig('orginMetadata', orginMetadata)
  console.log('saveOrginMetadata', orginMetadata)
}

export const useODataStore = defineStore('odata', () => {
  const odataUrl = ref('https://services.odata.org/V4/TripPinServiceRW/$metadata')
  const entitySets = ref<any[]>([])
  const allEntities = ref<any>({})
  const loading = ref(false)


  const connect = async () => {
    loading.value = true
    try {
      const res = await axios.get(odataUrl.value)
      await saveOrginMetadata(res.data)
      return true
    } catch (e) {
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  return { odataUrl, entitySets, allEntities, loading, connect }
})