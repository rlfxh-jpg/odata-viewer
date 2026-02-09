<template>
    <div class="entity-detail" v-if="data">
        <!-- 头部信息 -->
        <div class="header">
            <div class="title-row">
                <el-tag v-if="data.abstract === 'true'" effect="dark" size="small">Abstract</el-tag>
                <h2 class="entity-name">{{ data.name }}</h2>
                <span class="display-name">({{ getDisplayName(data) }})</span>
            </div>
            <div>
                <el-button type="primary" @click="visible = true" size="small">数据关系图</el-button>
                <el-button type="primary" @click="visible2 = true" size="small">类型继承树</el-button>
                <el-button type="primary" @click="visible = true" size="small">查看原始 JSON</el-button></div>
        </div>

        <!-- 基础属性表格 -->
        <el-card class="section-card" shadow="never">
            <template #header>
                <div class="card-header"><span>基础属性 (Properties)</span></div>
            </template>
            <el-table :data="data.property" stripe style="width: 100%" border>
                <el-table-column label="键" width="50" align="center">
                    <template #default="scope">
                        <el-icon v-if="isPrimaryKey(scope.row.name)" color="#E6A23C">
                            <Key />
                        </el-icon>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="字段名" width="150" />
                <el-table-column label="显示名称" width="150">
                    <template #default="scope">
                        {{ getDisplayName(scope.row) }}
                    </template>
                </el-table-column>
                <el-table-column prop="type" label="数据类型">
                    <template #default="scope">
                        <code class="type-code">{{ scope.row.type }}</code>
                    </template>
                </el-table-column>
                <el-table-column prop="nullable" label="允许空" width="80" align="center">
                    <template #default="scope">
                        <el-icon v-if="scope.row.nullable !== 'false'" color="#67C23A">
                            <Check />
                        </el-icon>
                        <el-icon v-else color="#F56C6C">
                            <Close />
                        </el-icon>
                    </template>
                </el-table-column>
                <el-table-column prop="maxLength" label="长度" width="80" />
            </el-table>
        </el-card>

        <!-- 导航属性（关联关系） -->
        <el-card class="section-card" shadow="never" style="margin-top: 20px;">
            <template #header>
                <div class="card-header"><span>导航属性 (Navigation Properties)</span></div>
            </template>
            <el-table :data="data.navigationProperty" stripe border>
                <el-table-column prop="name" label="关系名" width="150" />
                <el-table-column label="显示名称" width="150">
                    <template #default="scope">
                        {{ getDisplayName(scope.row) }}
                    </template>
                </el-table-column>
                <el-table-column label="目标实体类型">
                    <template #default="scope">
                        <el-link type="primary" @click="handleJump(scope.row.type)">
                            {{ scope.row.type }}
                        </el-link>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <jsonViewerDialog v-model="visible" :data="data" />
        <typeInheritanceTree v-model="visible2" :types="allTypes" />
    </div>
</template>

<script setup lang="ts">
import { Key, Check, Close } from '@element-plus/icons-vue'
import jsonViewerDialog from './jsonViewerDialog.vue';
import typeInheritanceTree from './typeInheritanceTree.vue';
import { ref } from 'vue'

interface Props {
    data: any // 接收你提供的 JSON 对象
}

const allTypes = ref([
  { name: 'Plt0ApplicationObject', abstract: 'true' },
  { name: 'Plt0User', baseType: 'Plt0ApplicationObject' },
  { name: 'Plt0Account', baseType: 'Plt0ApplicationObject' },
  { name: 'SpecialUser', baseType: 'Plt0User' }
])

const props = defineProps<Props>()
const emit = defineEmits(['jump'])
const visible = ref(false)
const visible2 = ref(false)

// 提取 DisplayName 的工具函数
const getDisplayName = (item: any): string => {
    if (!item.annotation || !Array.isArray(item.annotation)) return ''
    const found = item.annotation.find((a: any) => a.term === 'PaaS.DisplayName')
    if (found && found.string && found.string[0]) {
        return found.string[0].text
    }
    return ''
}

// 判断是否是主键
const isPrimaryKey = (fieldName: string): boolean => {
    if (!props.data.key || !props.data.key[0]?.propertyRef) return false
    return props.data.key[0].propertyRef.some((k: any) => k.name === fieldName)
}

// 处理点击导航属性跳转
const handleJump = (fullTypeName: string) => {
    // 去掉命名空间前缀，例如 "PaaS.Plt0User" -> "Plt0User"
    console.log(props.data)
    const entityName = fullTypeName.split('.').pop()
    emit('jump', entityName)
}
</script>

<style scoped>
.entity-detail {
    padding: 10px;
    background-color: #fff;
}

.header {
    margin-bottom: 20px;
    border-bottom: 2px solid #ebeef5;
    padding-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.entity-name {
    margin: 0;
    color: #303133;
    font-size: 20px;
}

.display-name {
    color: #909399;
    font-size: 14px;
}

.section-card {
    border: 1px solid #ebeef5;
}

.card-header {
    font-weight: bold;
    color: #409EFF;
}

.type-code {
    background-color: #f5f7fa;
    padding: 2px 6px;
    border-radius: 4px;
    color: #e67e22;
    font-family: monospace;
}
</style>