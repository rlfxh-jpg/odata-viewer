import { defineStore } from 'pinia'
import { ref } from 'vue'
//@ts-ignore
import * as odatajs from '../lib/odatajs/lib/odata.js';
import MetaDataXml from '../assets/metadata.xml?raw'
import { get_data, save_data } from '../utils/tool'
import { transformToTree } from '../utils/transformToTree.ts'

const ORGINMETADATA_KEY = 'orginMetadata11'
const TRANSFORMTOTREE = 'transformToTree'



export const useODataStore = defineStore('odata', () => {

  const loading = ref(false)
  const orginMetadata = ref<any>(null)
  const treeData = ref<any>()

  const connect = async () => {
    loading.value = true
    try {
      orginMetadata.value = odatajs.parseMetadata(MetaDataXml)
      treeData.value = await transformToTree(orginMetadata.value['dataServices']['schema'])
      return true
    } catch (e) {
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  return { loading, connect, orginMetadata, treeData }
})