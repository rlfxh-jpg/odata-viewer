<template>
  <section class="workbench">
    <el-card shadow="never" class="connect-card">
      <div class="connect-row">
        <el-input
          v-model="metadataUrl"
          placeholder="输入 OData Metadata URL，例如 https://host/odata/$metadata"
          @keyup.enter="handleConnectByUrl"
        >
          <template #append>
            <el-button :loading="connecting" type="primary" @click="handleConnectByUrl">Connect</el-button>
          </template>
        </el-input>
        <el-button @click="loadSampleMetadata">加载内置示例</el-button>
      </div>

      <div class="connect-row secondary-row">
        <el-select
          v-model="selectedHistoryUrl"
          placeholder="最近连接记录"
          clearable
          class="history-select"
          @change="handlePickHistory"
        >
          <el-option v-for="item in historyUrls" :key="item" :value="item" :label="item" />
        </el-select>

        <el-upload
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept=".xml,text/xml,application/xml"
          :before-upload="handleBeforeUpload"
          class="upload-box"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖拽 XML 到这里，或点击导入本地 Metadata</div>
        </el-upload>
      </div>
    </el-card>

    <div class="workspace">
      <el-card class="sidebar-card" shadow="never">
        <template #header>
          <div class="card-title">Schema Explorer</div>
        </template>
        <el-tree
          ref="treeRef"
          node-key="key"
          :data="treeData"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        />
      </el-card>

      <div class="viewer-area">
        <el-card shadow="never" class="viewer-card">
          <template #header>
            <div class="viewer-header">
              <div>
                <div class="card-title">Viewer</div>
                <div class="sub-title">{{ detailSubtitle }}</div>
              </div>
              <el-tag v-if="metadataModel" type="info">
                Source: {{ metadataModel.sourceLabel }}
              </el-tag>
            </div>
          </template>

          <el-empty v-if="!selectedNode" description="请先在左侧选择一个实体" />

          <template v-else>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="字段列表" name="table">
                <template v-if="propertyRows.length">
                  <el-table :data="propertyRows" border stripe>
                    <el-table-column prop="name" label="Name" min-width="170">
                      <template #default="{ row }">
                        <div class="field-name">
                          <el-tag v-if="isPrimaryKey(row.name)" type="warning" size="small">PK</el-tag>
                          {{ row.name }}
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column label="Type" min-width="180">
                      <template #default="{ row }">
                        {{ row.type.shortName }}<span v-if="row.type.isCollection">[]</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="Nullable" width="100">
                      <template #default="{ row }">
                        <el-tag :type="row.nullable ? 'success' : 'danger'" size="small">
                          {{ row.nullable ? 'Yes' : 'No' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="Description" min-width="220" />
                  </el-table>
                </template>
                <el-empty v-else-if="selectedEnumType" description="当前为枚举类型，请查看枚举值表格" />
                <el-empty v-else description="没有可显示的字段" />

                <el-card v-if="navigationRows.length" shadow="never" class="sub-card">
                  <template #header>
                    <div class="card-title">Navigation Properties</div>
                  </template>
                  <el-table :data="navigationRows" border stripe>
                    <el-table-column prop="name" label="Name" min-width="180" />
                    <el-table-column label="Target Type" min-width="220">
                      <template #default="{ row }">
                        <el-link type="primary" @click="jumpToNavigationTarget(row)">
                          {{ row.type.shortName }}<span v-if="row.type.isCollection">[]</span>
                        </el-link>
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="Description" min-width="220" />
                  </el-table>
                </el-card>

                <el-card v-if="selectedEnumType" shadow="never" class="sub-card">
                  <template #header>
                    <div class="card-title">Enum Members</div>
                  </template>
                  <el-table :data="selectedEnumType.members" border stripe>
                    <el-table-column prop="name" label="Key" min-width="200" />
                    <el-table-column prop="value" label="Value" min-width="200" />
                  </el-table>
                </el-card>
              </el-tab-pane>

              <el-tab-pane label="TypeScript 定义" name="ts">
                <div class="option-row">
                  <el-checkbox v-model="tsOptions.numberAsNumber">Edm.Int32 / Decimal 转 number</el-checkbox>
                  <el-checkbox v-model="tsOptions.dateTimeOffsetAsString">Edm.DateTimeOffset 转 string</el-checkbox>
                  <el-button type="primary" plain @click="copyTsCode">Copy</el-button>
                </div>
                <el-input :model-value="tsCode" type="textarea" :rows="16" readonly />
              </el-tab-pane>

              <el-tab-pane label="查询测试器" name="try">
                <template v-if="selectedEntitySet && selectedEntityType">
                  <el-alert
                    v-if="!activeServiceRoot"
                    title="当前 Metadata 来自本地文件，无法推导服务根地址。请先使用 URL 连接后再试。"
                    type="warning"
                    :closable="false"
                    show-icon
                    class="alert-space"
                  />

                  <div class="try-grid">
                    <el-form label-position="top">
                      <el-form-item label="$select">
                        <el-select v-model="selectedFields" multiple collapse-tags collapse-tags-tooltip>
                          <el-option
                            v-for="field in selectedEntityType.properties"
                            :key="field.name"
                            :label="field.name"
                            :value="field.name"
                          />
                        </el-select>
                      </el-form-item>

                      <el-form-item label="$expand">
                        <el-select v-model="selectedExpands" multiple collapse-tags collapse-tags-tooltip>
                          <el-option
                            v-for="nav in selectedEntityType.navigationProperties"
                            :key="nav.name"
                            :label="nav.name"
                            :value="nav.name"
                          />
                        </el-select>
                      </el-form-item>

                      <el-form-item label="$filter">
                        <el-autocomplete
                          v-model="filterText"
                          :fetch-suggestions="queryFilterSuggestion"
                          clearable
                          placeholder="例如 startswith(Name,'A') and IsDeleted eq false"
                        />
                      </el-form-item>

                      <el-form-item label="$top">
                        <el-input-number v-model="topValue" :min="1" :max="500" />
                      </el-form-item>
                    </el-form>

                    <div>
                      <el-form label-position="top">
                        <el-form-item label="请求 URL">
                          <el-input :model-value="generatedTryItUrl" type="textarea" :rows="4" readonly />
                        </el-form-item>
                      </el-form>

                      <el-button type="primary" :loading="tryItLoading" @click="runTryIt">运行</el-button>
                    </div>
                  </div>

                  <el-divider />
                  <el-input
                    :model-value="tryItResponse"
                    type="textarea"
                    :rows="12"
                    readonly
                    placeholder="运行后会显示 JSON 结果"
                  />
                </template>
                <el-empty v-else description="Try It 仅支持 EntitySet 节点" />
              </el-tab-pane>
            </el-tabs>
          </template>
        </el-card>

        <el-card shadow="never" class="diagram-card">
          <template #header>
            <div class="viewer-header">
              <div>
                <div class="card-title">ER Diagram</div>
                <div class="sub-title">勾选实体后自动绘制关系线，关系标签支持 1:1 / 1:N / N:N</div>
              </div>
            </div>
          </template>

          <el-checkbox-group v-model="diagramSelection" class="diagram-selector">
            <el-checkbox
              v-for="entitySet in metadataModel?.entitySets ?? []"
              :key="entitySet.name"
              :value="entitySetKey(entitySet)"
            >
              {{ entitySet.name }}
            </el-checkbox>
          </el-checkbox-group>

          <div class="diagram-board">
            <svg :viewBox="`0 0 ${diagramWidth} ${diagramHeight}`" preserveAspectRatio="none">
              <defs>
                <marker
                  id="arrowHead"
                  markerWidth="10"
                  markerHeight="8"
                  refX="9"
                  refY="4"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L10,4 L0,8 z" fill="#909399" />
                </marker>
              </defs>

              <g v-for="line in diagramLines" :key="line.key">
                <line
                  :x1="line.x1"
                  :y1="line.y1"
                  :x2="line.x2"
                  :y2="line.y2"
                  stroke="#909399"
                  stroke-width="1.5"
                  marker-end="url(#arrowHead)"
                />
                <text
                  :x="(line.x1 + line.x2) / 2"
                  :y="(line.y1 + line.y2) / 2 - 4"
                  fill="#606266"
                  font-size="12"
                >
                  {{ line.label }}
                </text>
              </g>
            </svg>

            <div
              v-for="node in diagramNodes"
              :key="node.key"
              class="diagram-node"
              :style="{ left: `${node.x}px`, top: `${node.y}px` }"
            >
              <div class="diagram-node-title">{{ node.entitySet.name }}</div>
              <div class="diagram-node-type">{{ node.entityType?.name ?? node.entitySet.entityTypeName }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import sampleMetadataXml from '../assets/metadata.xml?raw'
import { extractServiceRoot, parseODataMetadata } from '../utils/odata-metadata'
import type {
  ODataComplexType,
  ODataEntitySet,
  ODataEntityType,
  ODataEnumType,
  ODataMetadataModel,
  ODataNavigationProperty,
  ODataProperty,
  SchemaTreeNode,
} from '../utils/odata-types'
import { loadHistory, saveHistory } from '../utils/persist'
import type { TsGeneratorOptions } from '../utils/ts-generator'
import { generateTypeScriptDefinition } from '../utils/ts-generator'

const metadataUrl = ref('')
const selectedHistoryUrl = ref('')
const historyUrls = ref<string[]>([])
const connecting = ref(false)
const metadataModel = ref<ODataMetadataModel | null>(null)
const selectedNodeKey = ref('')
const activeTab = ref('table')
const treeRef = ref()

const tsOptions = ref<TsGeneratorOptions>({
  numberAsNumber: true,
  dateTimeOffsetAsString: true,
})

const selectedFields = ref<string[]>([])
const selectedExpands = ref<string[]>([])
const filterText = ref('')
const topValue = ref(20)
const tryItLoading = ref(false)
const tryItResponse = ref('')

const diagramWidth = 920
const diagramHeight = 340
const diagramSelection = ref<string[]>([])

const treeData = computed(() => metadataModel.value?.tree ?? [])

const treeNodeMap = computed(() => {
  const nodeMap: Record<string, SchemaTreeNode> = {}
  const travel = (nodes: SchemaTreeNode[]) => {
    for (const node of nodes) {
      nodeMap[node.key] = node
      if (node.children?.length) {
        travel(node.children)
      }
    }
  }
  travel(treeData.value)
  return nodeMap
})

const selectedNode = computed(() => {
  if (!selectedNodeKey.value) {
    return null
  }
  return treeNodeMap.value[selectedNodeKey.value] ?? null
})

const selectedEntitySet = computed(() => {
  if (selectedNode.value?.kind !== 'entitySet') {
    return null
  }
  return selectedNode.value.payload as ODataEntitySet
})

const selectedEntityType = computed<ODataEntityType | null>(() => {
  if (!selectedEntitySet.value || !metadataModel.value) {
    return null
  }
  return (
    metadataModel.value.entityTypeMap[selectedEntitySet.value.entityTypeFullName] ??
    metadataModel.value.entityTypeMap[selectedEntitySet.value.entityTypeName] ??
    null
  )
})

const selectedComplexType = computed<ODataComplexType | null>(() => {
  if (selectedNode.value?.kind !== 'complexType') {
    return null
  }
  return selectedNode.value.payload as ODataComplexType
})

const selectedEnumType = computed<ODataEnumType | null>(() => {
  if (selectedNode.value?.kind !== 'enumType') {
    return null
  }
  return selectedNode.value.payload as ODataEnumType
})

const propertyRows = computed<ODataProperty[]>(() => {
  if (selectedEntityType.value) {
    return selectedEntityType.value.properties
  }
  if (selectedComplexType.value) {
    return selectedComplexType.value.properties
  }
  return []
})

const navigationRows = computed<ODataNavigationProperty[]>(() => selectedEntityType.value?.navigationProperties ?? [])

const selectedTypeForCode = computed(() => selectedEntityType.value ?? selectedComplexType.value ?? selectedEnumType.value)

const tsCode = computed(() => {
  if (!metadataModel.value) {
    return '// 请先连接 OData Metadata'
  }
  return generateTypeScriptDefinition(selectedTypeForCode.value, metadataModel.value, tsOptions.value)
})

const detailSubtitle = computed(() => {
  if (selectedEntitySet.value) {
    return `${selectedEntitySet.value.name}  (EntityType: ${selectedEntitySet.value.entityTypeName})`
  }
  if (selectedComplexType.value) {
    return `${selectedComplexType.value.name} (ComplexType)`
  }
  if (selectedEnumType.value) {
    return `${selectedEnumType.value.name} (EnumType)`
  }
  return '未选择实体'
})

const activeServiceRoot = computed(() => {
  if (metadataModel.value?.serviceRoot) {
    return metadataModel.value.serviceRoot
  }
  return extractServiceRoot(metadataUrl.value)
})

const generatedTryItUrl = computed(() => {
  if (!selectedEntitySet.value || !activeServiceRoot.value) {
    return ''
  }
  const params = new URLSearchParams()
  if (selectedFields.value.length) {
    params.set('$select', selectedFields.value.join(','))
  }
  if (selectedExpands.value.length) {
    params.set('$expand', selectedExpands.value.join(','))
  }
  if (filterText.value.trim()) {
    params.set('$filter', filterText.value.trim())
  }
  if (topValue.value > 0) {
    params.set('$top', String(topValue.value))
  }
  const query = params.toString()
  const root = activeServiceRoot.value.replace(/\/$/, '')
  return `${root}/${selectedEntitySet.value.name}${query ? `?${query}` : ''}`
})

const filterSuggestionTemplates = computed(() => {
  if (!selectedEntityType.value) {
    return []
  }
  return selectedEntityType.value.properties.flatMap((field) => [
    { value: `${field.name} eq ` },
    { value: `${field.name} ne ` },
    { value: `${field.name} gt ` },
    { value: `startswith(${field.name}, '')` },
    { value: `contains(${field.name}, '')` },
  ])
})

const isPrimaryKey = (name: string): boolean => selectedEntityType.value?.keyNames.includes(name) ?? false

const entitySetKey = (entitySet: ODataEntitySet): string => `entitySet:${entitySet.name}`

const findFirstLeafNode = (nodes: SchemaTreeNode[]): SchemaTreeNode | null => {
  for (const node of nodes) {
    if (!node.children?.length && node.kind !== 'category') {
      return node
    }
    if (node.children?.length) {
      const found = findFirstLeafNode(node.children)
      if (found) {
        return found
      }
    }
  }
  return null
}

const initializeDiagramSelection = (model: ODataMetadataModel) => {
  diagramSelection.value = model.entitySets.slice(0, 6).map((entitySet) => entitySetKey(entitySet))
}

const useParsedModel = (model: ODataMetadataModel) => {
  metadataModel.value = model
  const firstLeaf = findFirstLeafNode(model.tree)
  selectedNodeKey.value = firstLeaf?.key ?? ''
  activeTab.value = 'table'
  tryItResponse.value = ''
  initializeDiagramSelection(model)
}

const appendHistory = async (url: string) => {
  const normalized = url.trim()
  if (!normalized) {
    return
  }
  historyUrls.value = [normalized, ...historyUrls.value.filter((item) => item !== normalized)].slice(0, 10)
  await saveHistory(historyUrls.value)
}

const connectByXmlText = (xmlText: string, sourceLabel: string, serviceRoot?: string) => {
  const nextModel = parseODataMetadata(xmlText, sourceLabel, serviceRoot)
  useParsedModel(nextModel)
}

const handleConnectByUrl = async () => {
  const targetUrl = metadataUrl.value.trim()
  if (!targetUrl) {
    ElMessage.warning('请先输入 Metadata URL')
    return
  }

  connecting.value = true
  try {
    const response = await axios.get<string>(targetUrl, {
      responseType: 'text',
      headers: {
        Accept: 'application/xml, text/xml, */*',
      },
    })
    connectByXmlText(response.data, targetUrl, extractServiceRoot(targetUrl))
    await appendHistory(targetUrl)
    ElMessage.success('Metadata 连接成功')
  } catch (error) {
    const message = axios.isAxiosError(error) ? error.message : '连接失败，请检查 URL 或网络'
    ElMessage.error(message)
  } finally {
    connecting.value = false
  }
}

const handlePickHistory = (pickedUrl: string | number | boolean) => {
  if (typeof pickedUrl !== 'string' || !pickedUrl) {
    return
  }
  metadataUrl.value = pickedUrl
  void handleConnectByUrl()
}

const loadSampleMetadata = () => {
  try {
    connectByXmlText(sampleMetadataXml, '内置示例 metadata.xml')
    ElMessage.success('示例 Metadata 已加载')
  } catch {
    ElMessage.error('示例 Metadata 解析失败')
  }
}

const handleBeforeUpload: UploadProps['beforeUpload'] = async (file) => {
  try {
    const xmlText = await file.text()
    connectByXmlText(xmlText, `文件: ${file.name}`)
    ElMessage.success('本地 XML 导入成功')
  } catch {
    ElMessage.error('XML 解析失败，请检查文件内容')
  }
  return false
}

const handleNodeClick = (node: SchemaTreeNode) => {
  if (node.kind === 'category') {
    return
  }
  selectedNodeKey.value = node.key
  activeTab.value = 'table'
}

const jumpToNavigationTarget = (navigation: ODataNavigationProperty) => {
  if (!metadataModel.value) {
    return
  }
  const target = metadataModel.value.entitySets.find(
    (entitySet) =>
      entitySet.entityTypeFullName === navigation.type.fullName ||
      entitySet.entityTypeName === navigation.type.shortName,
  )
  if (!target) {
    ElMessage.warning(`未找到 ${navigation.type.shortName} 对应的 EntitySet`)
    return
  }
  const key = entitySetKey(target)
  selectedNodeKey.value = key
  treeRef.value?.setCurrentKey?.(key)
  activeTab.value = 'table'
}

const copyTsCode = async () => {
  try {
    await navigator.clipboard.writeText(tsCode.value)
    ElMessage.success('TypeScript 定义已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const runTryIt = async () => {
  if (!generatedTryItUrl.value) {
    ElMessage.warning('请先连接 URL 类型的 Metadata，并选择 EntitySet')
    return
  }
  tryItLoading.value = true
  try {
    const response = await axios.get(generatedTryItUrl.value, {
      headers: {
        Accept: 'application/json',
      },
    })
    tryItResponse.value = JSON.stringify(response.data, null, 2)
  } catch (error) {
    const message = axios.isAxiosError(error) ? error.message : '请求失败'
    tryItResponse.value = message
    ElMessage.error(message)
  } finally {
    tryItLoading.value = false
  }
}

const queryFilterSuggestion = (
  query: string,
  callback: (items: Array<{ value: string }>) => void,
) => {
  const keyword = query.trim().toLowerCase()
  if (!keyword) {
    callback(filterSuggestionTemplates.value.slice(0, 12))
    return
  }
  const matched = filterSuggestionTemplates.value.filter((item) =>
    item.value.toLowerCase().includes(keyword),
  )
  callback(matched.slice(0, 12))
}

watch(
  selectedEntityType,
  (entityType) => {
    if (!entityType) {
      selectedFields.value = []
      selectedExpands.value = []
      filterText.value = ''
      topValue.value = 20
      return
    }
    selectedFields.value = entityType.properties.slice(0, 8).map((item) => item.name)
    selectedExpands.value = []
    filterText.value = ''
    topValue.value = 20
    tryItResponse.value = ''
  },
  { immediate: true },
)

watch(treeData, () => {
  if (!selectedNodeKey.value) {
    return
  }
  treeRef.value?.setCurrentKey?.(selectedNodeKey.value)
})

onMounted(async () => {
  historyUrls.value = await loadHistory()
  loadSampleMetadata()
})

interface DiagramNode {
  key: string
  x: number
  y: number
  entitySet: ODataEntitySet
  entityType: ODataEntityType | null
}

interface DiagramLine {
  key: string
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
}

const diagramNodes = computed<DiagramNode[]>(() => {
  if (!metadataModel.value) {
    return []
  }

  const selectedKeySet = new Set(diagramSelection.value)
  const selectedEntitySets = metadataModel.value.entitySets.filter((item) => selectedKeySet.has(entitySetKey(item)))
  const total = selectedEntitySets.length
  if (total === 0) {
    return []
  }

  const nodeWidth = 180
  const nodeHeight = 64
  const cols = Math.ceil(Math.sqrt(total))
  const rows = Math.ceil(total / cols)
  const gapX = cols === 1 ? 0 : (diagramWidth - 24 - nodeWidth) / (cols - 1)
  const gapY = rows === 1 ? 0 : (diagramHeight - 24 - nodeHeight) / (rows - 1)

  return selectedEntitySets.map((entitySet, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const x = 12 + col * gapX
    const y = 12 + row * gapY
    const entityType =
      metadataModel.value?.entityTypeMap[entitySet.entityTypeFullName] ??
      metadataModel.value?.entityTypeMap[entitySet.entityTypeName] ??
      null
    return {
      key: entitySetKey(entitySet),
      x,
      y,
      entitySet,
      entityType,
    }
  })
})

const resolveRelationLabel = (
  sourceNavigation: ODataNavigationProperty,
  reverseNavigation: ODataNavigationProperty | undefined,
): string => {
  const sourceMany = sourceNavigation.type.isCollection
  const targetMany = reverseNavigation?.type.isCollection ?? false
  if (sourceMany && targetMany) {
    return 'N:N'
  }
  if (sourceMany || targetMany) {
    return '1:N'
  }
  return '1:1'
}

const diagramLines = computed<DiagramLine[]>(() => {
  const lines: DiagramLine[] = []
  const pairGuard = new Set<string>()

  for (const sourceNode of diagramNodes.value) {
    if (!sourceNode.entityType) {
      continue
    }

    for (const navigation of sourceNode.entityType.navigationProperties) {
      const targetNode = diagramNodes.value.find(
        (node) =>
          node.entitySet.entityTypeFullName === navigation.type.fullName ||
          node.entitySet.entityTypeName === navigation.type.shortName,
      )
      if (!targetNode || targetNode.key === sourceNode.key) {
        continue
      }

      const pairKey = [sourceNode.key, targetNode.key].sort().join('|')
      if (pairGuard.has(pairKey)) {
        continue
      }
      pairGuard.add(pairKey)

      const reverseNavigation = targetNode.entityType?.navigationProperties.find(
        (item) =>
          item.type.fullName === sourceNode.entitySet.entityTypeFullName ||
          item.type.shortName === sourceNode.entitySet.entityTypeName,
      )

      const sourceCenter = {
        x: sourceNode.x + 90,
        y: sourceNode.y + 32,
      }
      const targetCenter = {
        x: targetNode.x + 90,
        y: targetNode.y + 32,
      }

      lines.push({
        key: `${pairKey}:${navigation.name}`,
        x1: sourceCenter.x,
        y1: sourceCenter.y,
        x2: targetCenter.x,
        y2: targetCenter.y,
        label: resolveRelationLabel(navigation, reverseNavigation),
      })
    }
  }

  return lines
})
</script>

<style scoped>
.workbench {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.connect-card {
  flex-shrink: 0;
}

.connect-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}

.secondary-row {
  margin-top: 12px;
  align-items: start;
}

.history-select {
  width: 100%;
}

.upload-box {
  width: 320px;
}

.workspace {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 12px;
  min-height: 0;
}

.sidebar-card {
  min-height: 0;
}

.sidebar-card :deep(.el-card__body) {
  height: calc(100% - 56px);
  overflow: auto;
}

.viewer-area {
  min-height: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 12px;
}

.viewer-card :deep(.el-card__body) {
  height: calc(100% - 56px);
  overflow: auto;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-weight: 600;
}

.sub-title {
  margin-top: 2px;
  color: #909399;
  font-size: 12px;
}

.field-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-card {
  margin-top: 12px;
}

.option-row {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.alert-space {
  margin-bottom: 12px;
}

.try-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.diagram-card {
  flex-shrink: 0;
}

.diagram-selector {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.diagram-board {
  position: relative;
  height: 340px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
  overflow: hidden;
}

.diagram-board svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.diagram-node {
  position: absolute;
  width: 180px;
  height: 64px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  padding: 10px;
}

.diagram-node-title {
  font-weight: 600;
  font-size: 13px;
}

.diagram-node-type {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}
</style>
