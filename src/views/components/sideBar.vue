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

// 在 src/store/odata.ts 或组件中编写转换逻辑
const transformToTree = (schemas: any[]) => {
    let temp_id = 10000
    return schemas.map(schema => {
        const children = [];
        // 1. 处理 EntityType (实体类型)
        if (schema.entityType && schema.entityType.length) {
            children.push({
                label: 'EntityTypes',
                type: 'category',
                id: temp_id++,
                children: schema.entityType.map((t: any) => ({
                    label: t.name,
                    type: 'entityType',
                    id: temp_id++,
                    data: t // 保存原始数据，方便点击时显示
                }))
            });
        }

        // 2. 处理 ComplexType (复杂类型)
        if (schema.complexType && schema.complexType.length) {
            children.push({
                label: 'ComplexTypes',
                type: 'category',
                id: temp_id++,
                children: schema.complexType.map((t: any) => ({
                    label: t.name,
                    type: 'complexType',
                    id: temp_id++,
                    data: t
                }))
            });
        }

        // 3. 处理 EnumType (枚举类型)
        if (schema.enumType && schema.enumType.length) {
            children.push({
                label: 'EnumTypes',
                type: 'category',
                id: temp_id++,
                children: schema.enumType.map((t: any) => ({
                    label: t.name,
                    type: 'enumType',
                    id: temp_id++,
                    data: t
                }))
            });
        }

        // 4. 处理 Term (语义)
        if (schema.term && schema.term.length) {
            children.push({
                label: 'Terms',
                type: 'category',
                id: temp_id++,
                children: schema.term.map((t: any) => ({
                    label: t.name,
                    type: 'term',
                    id: temp_id++,
                    data: t
                }))
            });
        }
        // 5. 处理 EntityContainer (实体容器)
        if (schema.entityContainer) {
            children.push({
                label: 'EntityContainer',
                type: 'category',
                id:temp_id++,
                children: {}
            });
            let newchildren = []
            if (schema.entityContainer.actionImport && schema.entityContainer.actionImport.length) {
                newchildren.push({
                    label: 'ActionImport',
                    type: 'category',
                    id: temp_id++,
                    children: schema.entityContainer.actionImport.map((t: any) => ({
                        label: t.name,
                        type: 'actionImport',
                        id: temp_id++,
                        data: t
                    }))
                });
            }

            if (schema.entityContainer.entitySet && schema.entityContainer.entitySet.length) {
                newchildren.push({
                    label: 'EntitySet',
                    type: 'category',
                    id: temp_id++,
                    children: schema.entityContainer.entitySet.map((t: any) => ({
                        label: t.name,
                        type: 'entitySet',
                        id: temp_id++,
                        data: t
                    }))
                });
            }

            if (schema.entityContainer.functionImport && schema.entityContainer.functionImport.length) {
                newchildren.push({
                    label: 'FunctionImport',
                    type: 'category',
                    id: temp_id++,
                    children: schema.entityContainer.functionImport.map((t: any) => ({
                        label: t.name,
                        type: 'functionImport',
                        id: temp_id++,
                        data: t
                    }))
                });
            }
            children.at(-1).children=newchildren

        }

        if (schema.function && schema.function.length) {
            children.push({
                label: 'Function',
                type: 'category',
                id: temp_id++,
                children: schema.function.map((t: any) => ({
                    label: t.name,
                    type: 'function',
                    id: temp_id++,
                    data: t
                }))
            });
        }

        if (schema.action && schema.action.length) {
            children.push({
                label: 'Action',
                type: 'category',
                id: temp_id++,
                children: schema.action.map((t: any) => ({
                    label: t.name,
                    type: 'action',
                    id: temp_id++,
                    data: t
                }))
            });
        }

        return {
            label: schema.namespace || schema.alias || 'Unknown Namespace',
            type: 'namespace',
            id: temp_id++,
            children: children
        };
    });
};

const props = defineProps<{
    rawSchemas?: any[] // 传入你截图里那个 schema 数组
}>()

const emit = defineEmits(['node-click'])
const treeRef = ref()
const filterText = ref('')

const defaultProps = {
    children: 'children',
    label: 'label',
}

// 转换后的树数据
const treeData = computed(() => transformToTree(props.rawSchemas))

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