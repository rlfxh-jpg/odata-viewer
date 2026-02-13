<template>
    <div class="Home-page">
        <div class="side">
            <sideBar ref="sideBarRef" :tree-data="treeData" @node-click="handleNodeClick" />
        </div>
        <div class="main">
            <!-- 动态组件渲染 -->
            <component
                :is="currentComponent"
                :data="panelData"
                @jump="handleJump"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useODataStore } from '../store/odata'
import sideBar from './components/sideBar.vue'
// 导入所有详情组件
import entityType from './components/entityType.vue'
import complexType from './components/complexType.vue'
import enumType from './components/enumType.vue'
import entitySet from './components/entitySet.vue'
import action from './components/action.vue'
import actionImport from './components/actionImport.vue'
import function_ from './components/function.vue'
import functionImport from './components/functionImport.vue'
import term from './components/term.vue'

import { ref, computed, onMounted } from 'vue'

// 组件映射表
const componentMap: Record<string, any> = {
  entityType,
  complexType,
  enumType,
  entitySet,
  action,
  actionImport,
  function: function_,
  functionImport,
  term
}

const treeData = ref([])
const store = useODataStore()
const panelData = ref(null)
const currentNodeType = ref('')
const sideBarRef = ref()

// 根据节点类型获取对应组件
const currentComponent = computed(() => {
  return componentMap[currentNodeType.value] || null
})

const handleNodeClick = (node: any) => {
    if (node.type === 'category' || node.type === 'namespace') return
    panelData.value = node.data
    currentNodeType.value = node.type
    console.log(node)
}

const handleJump = (typeName: string) => {
    // 在树数据中查找对应的节点
    const findNode = (nodes: any[], targetName: string): any => {
        for (const node of nodes) {
            if (node.type && node.data && node.data.name === targetName) {
                return node
            }
            if (node.children) {
                const found = findNode(node.children, targetName)
                if (found) return found
            }
        }
        return null
    }

    const targetNode = findNode(treeData.value, typeName)
    if (targetNode) {
        // 调用 sideBar 的方法来选中节点
        sideBarRef.value?.selectNodeByTypeName(typeName)
        // 更新右侧详情
        panelData.value = targetNode.data
        currentNodeType.value = targetNode.type
    }
}

onMounted(async () => {
    await store.connect()
    treeData.value = store.treeData
})
</script>
<style lang="less" scoped>
.Home-page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    background-color: rgb(255, 255, 255);
    border-radius: 10px;

    .side {
        width: 300px;
        height: 100%;
        padding: 3px;
        overflow: auto;
        overflow-y: auto;
    }

    .main {
        flex: 1;
        overflow: auto;
        // background-color: aqua;
    }
}
</style>