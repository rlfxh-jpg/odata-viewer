import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
//@ts-ignore
import * as odatajs from '../lib/odatajs/lib/odata.js';
import testXml from '../assets/metadata.xml?raw'

const saveOrginMetadata = async (orginMetadata: any) => {
  await window.electronAPI.saveConfig('orginMetadata11', orginMetadata)
  //console.log('saveOrginMetadata', orginMetadata)
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
      const metadata =odatajs.parseMetadata(testXml)
      console.log(metadata)
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