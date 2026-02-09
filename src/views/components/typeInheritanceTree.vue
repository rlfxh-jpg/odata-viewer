<template>
  <!-- v-model 控制弹窗显示隐藏 -->
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="继承关系树"
    width="500px"
    destroy-on-close
  >
    <div class="tree-wrapper">
      <el-tree 
        :data="computedTree" 
        default-expand-all 
        :expand-on-click-node="false"
      >
        <template #default="{ data }">
          <div class="custom-node">
            <!-- 如果是抽象类，加粗并显示标签 -->
            <template v-if="data.abstract === 'true' || data.abstract === true">
              <strong class="abstract-name">{{ data.name }}</strong>
              <el-tag size="small" type="info" effect="plain" class="ml-2">abstract</el-tag>
            </template>
            <!-- 普通类 -->
            <span v-else>{{ data.name }}</span>
          </div>
        </template>
      </el-tree>
    </div>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 1. 定义 Props
interface TypeItem {
  name: string
  abstract?: string | boolean
  baseType?: string
  [key: string]: any
}

const props = defineProps<{
  modelValue: boolean   // 弹窗开关
  types: TypeItem[]     // 原始扁平数组
}>()

// 2. 定义 Emits
defineEmits(['update:modelValue'])

// 3. 核心逻辑：将扁平数据转换为树结构
const computedTree = computed(() => {
  if (!props.types || props.types.length === 0) return []
  
  const map = new Map()
  // 先把所有节点存入 map
  props.types.forEach((t) => {
    map.set(t.name, { ...t, children: [] })
  })

  const roots: any[] = []
  map.forEach((t) => {
    // 检查是否有父类，且父类在当前列表中存在
    if (t.baseType && map.has(t.baseType)) {
      map.get(t.baseType).children.push(t)
    } else {
      // 没有父类或者父类不在列表中，作为根节点
      roots.push(t)
    }
  })
  return roots
})
</script>

<style scoped>
.tree-wrapper {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.custom-node {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.abstract-name {
  color: #409eff;
}

.ml-2 {
  margin-left: 8px;
}
</style>