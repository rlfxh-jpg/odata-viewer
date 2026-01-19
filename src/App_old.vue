<template>
  <el-container class="layout-container">
    <!-- 顶部：连接区域 -->
    <el-header class="header">
      <el-input v-model="odataUrl" placeholder="输入 OData Metadata 地址 (http://.../$metadata)" class="input-with-select">
        <template #append>
          <el-button @click="connectOData" :loading="loading">Connect</el-button>
        </template>
      </el-input>
    </el-header>

    <el-container>
      <!-- 左侧：实体列表 -->
      <el-aside width="250px" class="aside">
        <div class="aside-title">Entity Sets</div>
        <el-menu @select="handleSelectEntity">
          <el-menu-item v-for="item in entitySets" :key="item.name" :index="item.name">
            <el-icon>
              <Check />
            </el-icon>
            <span>{{ item.name }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 中间：字段详情 -->
      <el-main>
        <div v-if="selectedEntity" class="detail-header">
          <h2>{{ selectedEntity.name }}</h2>
          <el-tag type="info">{{ selectedEntity.type }}</el-tag>
        </div>

        <el-table :data="currentFields" stripe style="width: 100%" v-if="selectedEntity">
          <el-table-column prop="name" label="字段名" />
          <el-table-column prop="type" label="类型" width="180" />
          <el-table-column prop="nullable" label="允许空" width="100">
            <template #default="scope">
              <el-icon v-if="scope.row.nullable" color="green">
                <Check />
              </el-icon>
              <el-icon v-else color="red">
                <Close />
              </el-icon>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="请先连接服务并选择实体" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'
import { Check, Close } from '@element-plus/icons-vue'

const odataUrl = ref('https://services.odata.org/V4/TripPinServiceRW/$metadata')
const loading = ref(false)
const entitySets = ref<any[]>([])
const allEntities = ref<any>({}) // 存储所有的 EntityType 定义
const selectedEntity = ref<any>(null)
const currentFields = ref<any[]>([])

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" })

const connectOData = async () => {
  loading.value = true
  try {
    const res = await axios.get(odataUrl.value)
    const jsonObj = parser.parse(res.data)

    // OData V4 解析逻辑简化版
    const schema = jsonObj['edmx:Edmx']['edmx:DataServices']['Schema']
    const container = schema.EntityContainer
    const entityTypes = schema.EntityType

    // 1. 解析所有的 EntityType 结构
    const typeMap: any = {}
    entityTypes.forEach((t: any) => {
      typeMap[t.Name] = t.Property
    })
    allEntities.value = typeMap

    // 2. 解析展示用的 EntitySet
    entitySets.value = container.EntitySet.map((s: any) => ({
      name: s.Name,
      typeName: s.EntityType.split('.').pop() // 获取简短类型名
    }))

  } catch (error) {
    console.error('连接失败', error)
  } finally {
    loading.value = false
  }
}

const handleSelectEntity = (name: string) => {
  const set = entitySets.value.find(s => s.name === name)
  if (set) {
    selectedEntity.value = set
    const rawFields = allEntities.value[set.typeName] || []
    currentFields.value = (Array.isArray(rawFields) ? rawFields : [rawFields]).map((f: any) => ({
      name: f.Name,
      type: f.Type,
      nullable: f.Nullable !== 'false'
    }))
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: sans-serif;
}

.layout-container {
  height: 100vh;
}

.header {
  padding: 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #ddd;
}

.aside {
  border-right: 1px solid #ddd;
  background: #fff;
}

.aside-title {
  padding: 15px;
  font-weight: bold;
  color: #909399;
  font-size: 12px;
  text-transform: uppercase;
}

.detail-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

h2 {
  margin: 0;
}
</style>