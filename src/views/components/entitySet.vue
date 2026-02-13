<template>
    <div class="entity-set-detail" v-if="data">
        <!-- 头部信息 -->
        <div class="header">
            <div class="title-row">
                <h2 class="set-name">{{ data.name }}</h2>
                <span class="display-name">({{ getDisplayName(data) }})</span>
            </div>
            <div>
                <el-button type="primary" @click="visible = true" size="small">查看原始 JSON</el-button>
            </div>
        </div>

        <!-- 实体类型信息 -->
        <el-card class="section-card" shadow="never">
            <template #header>
                <div class="card-header"><span>实体类型</span></div>
            </template>
            <el-descriptions :column="1" border>
                <el-descriptions-item label="实体集名称">{{ data.name }}</el-descriptions-item>
                <el-descriptions-item label="实体类型">
                    <el-link type="primary" @click="handleJump(data.entityType)">
                        {{ data.entityType }}
                    </el-link>
                </el-descriptions-item>
            </el-descriptions>
        </el-card>

        <!-- 导航属性绑定 -->
        <el-card class="section-card" shadow="never" v-if="data.navigationPropertyBinding && data.navigationPropertyBinding.length">
            <template #header>
                <div class="card-header"><span>导航属性绑定</span></div>
            </template>
            <el-table :data="data.navigationPropertyBinding" stripe style="width: 100%" border>
                <el-table-column prop="path" label="路径" width="200" />
                <el-table-column prop="target" label="目标">
                    <template #default="scope">
                        <el-link type="primary" @click="handleJump(scope.row.target)">
                            {{ scope.row.target }}
                        </el-link>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <jsonViewerDialog v-model="visible" :data="data" />
    </div>
</template>

<script setup lang="ts">
import jsonViewerDialog from './jsonViewerDialog.vue';
import { ref } from 'vue'

interface Props {
    data: any // 接收 EntitySet 的 JSON 对象
}

const props = defineProps<Props>()
const emit = defineEmits(['jump'])
const visible = ref(false)

// 提取 DisplayName 的工具函数
const getDisplayName = (item: any): string => {
    if (!item.annotation || !Array.isArray(item.annotation)) return ''
    const found = item.annotation.find((a: any) => a.term === 'PaaS.DisplayName')
    if (found && found.string && found.string[0]) {
        return found.string[0].text
    }
    return ''
}

// 处理点击实体类型跳转
const handleJump = (fullTypeName: string) => {
    const entityName = fullTypeName.split('.').pop()
    emit('jump', entityName)
}
</script>

<style scoped>
.entity-set-detail {
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

.set-name {
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
    margin-bottom: 20px;
}

.section-card:last-child {
    margin-bottom: 0;
}

.card-header {
    font-weight: bold;
    color: #409EFF;
}
</style>
