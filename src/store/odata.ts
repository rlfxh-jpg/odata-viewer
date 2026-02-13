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

  // 获取所有类型（包括 EntityType 和 ComplexType）用于继承树
  const getAllTypes = () => {
    if (!orginMetadata.value || !orginMetadata.value['dataServices']) {
      return []
    }

    // 辅助函数：从完整类型名中提取短名称（去掉命名空间）
    const getShortName = (fullName: string): string => {
      return fullName.split('.').pop() || fullName
    }

    const schemas = orginMetadata.value['dataServices']['schema']
    const types: any[] = []

    schemas.forEach((schema: any) => {
      // 添加 EntityType
      if (schema.entityType && Array.isArray(schema.entityType)) {
        schema.entityType.forEach((entity: any) => {
          types.push({
            name: entity.name,
            abstract: entity.abstract,
            baseType: entity.baseType ? getShortName(entity.baseType) : undefined,
            type: 'entityType'
          })
        })
      }
      // 添加 ComplexType
      if (schema.complexType && Array.isArray(schema.complexType)) {
        schema.complexType.forEach((complex: any) => {
          types.push({
            name: complex.name,
            abstract: complex.abstract,
            baseType: complex.baseType ? getShortName(complex.baseType) : undefined,
            type: 'complexType'
          })
        })
      }
    })

    return types
  }

  return { loading, connect, orginMetadata, treeData, getAllTypes }
})