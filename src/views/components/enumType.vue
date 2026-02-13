<template>
  <div v-if="data" class="enum-detail">
    <div class="header">
      <div class="title-row">
        <el-tag v-if="data.underlyingType" type="info" size="small">{{ data.underlyingType }}</el-tag>
        <el-tag v-if="data.isFlags" type="warning" size="small">Flags</el-tag>
        <h3 class="enum-name">{{ data.name }}</h3>
        <span v-if="data.displayName" class="display-name">({{ data.displayName }})</span>
      </div>
      <el-button size="small" type="primary" @click="rawVisible = true">Raw JSON</el-button>
    </div>

    <p v-if="data.description" class="enum-description">{{ data.description }}</p>

    <el-descriptions :column="2" border size="small">
      <el-descriptions-item label="Full Name">{{ data.fullName }}</el-descriptions-item>
      <el-descriptions-item label="Flags">{{ data.isFlags ? 'Yes' : 'No' }}</el-descriptions-item>
      <el-descriptions-item label="Underlying Type">{{ data.underlyingType || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Members">{{ memberRows.length }}</el-descriptions-item>
      <el-descriptions-item label="Config" :span="2">{{ configSummary || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Annotations" :span="2">
        {{ annotationSummary || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <el-table :data="memberRows" stripe border>
      <el-table-column prop="name" label="Name" min-width="180" />
      <el-table-column prop="displayName" label="Display Name" min-width="180" />
      <el-table-column prop="value" label="Value" width="120" />
      <el-table-column prop="description" label="Description" min-width="220" />
    </el-table>

    <json-viewer-dialog v-model="rawVisible" :data="data" :title="`Raw JSON - EnumType ${data.name}`" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ODataEnumType } from '../../utils/odata-types'
import JsonViewerDialog from './jsonViewerDialog.vue'

const props = defineProps<{
  data: ODataEnumType | null
}>()

const rawVisible = ref(false)

const memberRows = computed(() => {
  if (!props.data) {
    return []
  }
  return props.data.members.map((member) => ({
    name: member.name,
    displayName: member.displayName || '-',
    value: member.value ?? '-',
    description: member.description || '-',
  }))
})

const configSummary = computed(() => {
  if (!props.data?.config) {
    return ''
  }
  const pairs = Object.entries(props.data.config).filter(([, value]) => Boolean(value))
  return pairs.map(([key, value]) => `${key}=${value}`).join(', ')
})

const annotationSummary = computed(() => {
  if (!props.data?.annotations?.length) {
    return ''
  }
  return props.data.annotations
    .map((annotation) => {
      const key = annotation.qualifier ? `${annotation.term}#${annotation.qualifier}` : annotation.term
      return annotation.value ? `${key}=${annotation.value}` : key
    })
    .join('; ')
})
</script>

<style scoped>
.enum-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.enum-name {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.display-name {
  color: #909399;
}

.enum-description {
  margin: 0;
  color: #606266;
}
</style>
