<template>
    <div class="tree-container">
        <el-input v-model="filterText" placeholder="搜索实体..." class="filter-input" />

        <el-tree ref="treeRef" :data="treeData" :props="defaultProps" :filter-node-method="filterNode"
            @node-click="handleNodeClick" highlight-current class="odata-tree">
            <template #default="{ node, data }">
                <span class="custom-tree-node">
                    <!-- 根据不同层级显示不同图标 -->
                    <el-icon v-if="data.type === 'namespace'">
                        <FolderOpened />
                    </el-icon>
                    <el-icon v-else-if="data.type === 'category'">
                        <Collection />
                    </el-icon>
                    <el-icon v-else-if="data.type === 'entityType'">
                        <Collection />
                    </el-icon>
                    <el-icon v-else-if="data.type === 'complexType'">
                        <Memo />
                    </el-icon>
                    <el-icon v-else-if="data.type === 'enumType'">
                        <List />
                    </el-icon>

                    <span class="node-label">{{ node.label }}</span>
                </span>
            </template>
        </el-tree>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FolderOpened, Collection, Memo, List } from '@element-plus/icons-vue'



const props = defineProps<{
    treeData?: any[] // 传入你截图里那个 schema 数组
}>()

const emit = defineEmits(['node-click'])
const treeRef = ref()
const filterText = ref('')

const defaultProps = {
    children: 'children',
    label: 'label',
}


// 过滤搜索功能
watch(filterText, (val) => {
    treeRef.value!.filter(val)
})

const filterNode = (value: string, data: any) => {
    if (!value) return true
    return data.label.toLowerCase().includes(value.toLowerCase())
}

// 点击具体项（叶子节点）时的回调
const handleNodeClick = (nodeData: any) => {
    // if (nodeData && (nodeData.type == 'namespace' || nodeData.type == 'category')) return
    emit('node-click', nodeData)
}
</script>

<style scoped>
.tree-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: white;
}


.odata-tree {
    flex: 1;
    overflow-y: auto;
}

.custom-tree-node {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
}

.node-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>