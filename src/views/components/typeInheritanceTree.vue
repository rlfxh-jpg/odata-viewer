<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="dialogTitle"
    width="92%"
    top="4vh"
    class="inheritance-dialog"
    append-to-body
    lock-scroll
    destroy-on-close
  >
    <div class="inheritance-content">
      <div class="tree-wrapper">
        <el-tree
          :data="computedTree"
          node-key="fullName"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          :current-node-key="resolvedCurrentTypeFullName"
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <div class="custom-node" :class="{ current: isCurrentNode(data) }">
              <template v-if="data.abstract === 'true' || data.abstract === true">
                <strong class="abstract-name">{{ resolveQualifiedName(data) }}</strong>
                <el-tag size="small" type="info" effect="plain" class="ml-2">abstract</el-tag>
              </template>
              <span v-else>{{ resolveQualifiedName(data) }}</span>
              <el-tag v-if="isCurrentNode(data)" size="small" type="primary" effect="dark" class="ml-2">current</el-tag>
            </div>
          </template>
        </el-tree>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type TypeKind = 'entityType' | 'complexType'

interface TypeItem {
  name: string
  fullName?: string
  abstract?: string | boolean
  baseType?: string
  baseTypeFullName?: string
  kind?: TypeKind
  type?: TypeKind
  [key: string]: unknown
}

interface TreeNode extends TypeItem {
  fullName: string
  kind: TypeKind
  children: TreeNode[]
}

const props = defineProps<{
  modelValue: boolean
  types: TypeItem[]
  currentTypeName?: string
  kind?: TypeKind
}>()

const dialogTitle = computed(() => {
  const kindTitle = props.kind === 'complexType' ? 'ComplexType Inheritance' : 'EntityType Inheritance'
  if (!props.currentTypeName) {
    return kindTitle
  }
  const currentShortName = props.currentTypeName.split('.').pop() || props.currentTypeName
  return `${kindTitle} - ${currentShortName}`
})

const normalizedTypes = computed<TreeNode[]>(() => {
  const source = Array.isArray(props.types) ? props.types : []
  return source
    .map((item) => {
      const kind = (item.kind ?? item.type ?? 'entityType') as TypeKind
      const fullName = (item.fullName as string | undefined) ?? item.name
      return {
        ...item,
        kind,
        fullName,
        children: [],
      }
    })
    .filter((item) => (props.kind ? item.kind === props.kind : true))
})

const resolvedCurrentTypeFullName = computed(() => {
  if (!props.currentTypeName) {
    return ''
  }
  const exact = normalizedTypes.value.find((item) => item.fullName === props.currentTypeName)
  if (exact) {
    return exact.fullName
  }
  const fuzzy = normalizedTypes.value.find(
    (item) => item.name === props.currentTypeName || item.fullName.endsWith(`.${props.currentTypeName}`),
  )
  return fuzzy?.fullName ?? ''
})

const computedTree = computed<TreeNode[]>(() => {
  if (!normalizedTypes.value.length) {
    return []
  }

  const map = new Map<string, TreeNode>()
  for (const item of normalizedTypes.value) {
    map.set(item.fullName, { ...item, children: [] })
  }

  const findParent = (node: TreeNode): TreeNode | undefined => {
    const parentFull = (node.baseTypeFullName as string | undefined) ?? (node.baseType as string | undefined)
    if (!parentFull) {
      return undefined
    }

    if (map.has(parentFull)) {
      return map.get(parentFull)
    }

    for (const candidate of map.values()) {
      if (candidate.name === parentFull || candidate.fullName.endsWith(`.${parentFull}`)) {
        return candidate
      }
    }
    return undefined
  }

  const roots: TreeNode[] = []
  for (const node of map.values()) {
    const parent = findParent(node)
    if (!parent) {
      roots.push(node)
      continue
    }
    parent.children.push(node)
  }

  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((left, right) => {
      const namespaceCompare = resolveNamespace(left).localeCompare(resolveNamespace(right))
      if (namespaceCompare !== 0) {
        return namespaceCompare
      }
      return left.name.localeCompare(right.name)
    })
    for (const node of nodes) {
      sortTree(node.children)
    }
  }

  sortTree(roots)

  const resolveCurrentNode = (): TreeNode | undefined => {
    if (!props.currentTypeName) {
      return undefined
    }
    if (map.has(props.currentTypeName)) {
      return map.get(props.currentTypeName)
    }
    for (const candidate of map.values()) {
      if (candidate.name === props.currentTypeName || candidate.fullName.endsWith(`.${props.currentTypeName}`)) {
        return candidate
      }
    }
    return undefined
  }

  const cloneWithDescendants = (node: TreeNode): TreeNode => ({
    ...node,
    children: node.children.map((child) => cloneWithDescendants(child)),
  })

  const currentNode = resolveCurrentNode()
  if (!currentNode) {
    return roots
  }

  const pathToCurrent: TreeNode[] = []
  let cursor: TreeNode | undefined = currentNode
  while (cursor) {
    pathToCurrent.push(cursor)
    cursor = findParent(cursor)
  }
  pathToCurrent.reverse()

  if (pathToCurrent.length === 1) {
    return [cloneWithDescendants(currentNode)]
  }

  const focusedRoot: TreeNode = {
    ...pathToCurrent[0],
    children: [],
  }
  let parentClone = focusedRoot

  for (let i = 1; i < pathToCurrent.length; i++) {
    const sourceNode = pathToCurrent[i]
    const isCurrent = i === pathToCurrent.length - 1
    const nextClone: TreeNode = isCurrent
      ? cloneWithDescendants(sourceNode)
      : {
          ...sourceNode,
          children: [],
        }
    parentClone.children = [nextClone]
    parentClone = nextClone
  }

  return [focusedRoot]
})

const isCurrentNode = (node: TreeNode): boolean => {
  if (!resolvedCurrentTypeFullName.value) {
    return false
  }
  return node.fullName === resolvedCurrentTypeFullName.value
}

const resolveNamespace = (node: TreeNode): string => {
  const parts = node.fullName.split('.')
  if (parts.length <= 1) {
    return ''
  }
  return parts.slice(0, -1).join('.')
}

const resolveQualifiedName = (node: TreeNode): string => node.fullName || node.name

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'select-type', payload: { fullName: string; kind: TypeKind }): void
}>()

const handleNodeClick = (node: TreeNode) => {
  emit('select-type', {
    fullName: node.fullName,
    kind: node.kind,
  })
}
</script>

<style scoped>
.inheritance-content {
  height: calc(92vh - 96px);
  min-height: 420px;
  display: flex;
  flex-direction: column;
}

.tree-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 10px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.custom-node {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  border-radius: 4px;
  padding: 2px 6px;
}

.custom-node.current {
  color: #1d4ed8;
  font-weight: 600;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.abstract-name {
  color: #409eff;
}

.ml-2 {
  margin-left: 8px;
}

.inheritance-dialog :deep(.el-dialog) {
  height: 92vh;
  display: flex;
  flex-direction: column;
}

.inheritance-dialog :deep(.el-dialog__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding-top: 10px;
}

.inheritance-dialog :deep(.el-overlay-dialog) {
  overflow: hidden;
}
</style>
