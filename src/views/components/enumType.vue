<template>
    <div class="enum-detail" v-if="data">
        <!-- 头部信息 -->
        <div class="header">
            <div class="title-row">
                <el-tag v-if="data.underlyingType" type="info" size="small">{{ data.underlyingType }}</el-tag>
                <h2 class="enum-name">{{ data.name }}</h2>
                <span class="display-name">({{ getDisplayName(data) }})</span>
            </div>
            <div>
                <el-button type="primary" @click="visible = true" size="small">查看原始 JSON</el-button>
            </div>
        </div>

        <!-- 枚举成员表格 -->
        <el-card class="section-card" shadow="never">
            <template #header>
                <div class="card-header"><span>枚举成员 (Members)</span></div>
            </template>
            <el-table :data="data.member" stripe style="width: 100%" border>
                <el-table-column prop="name" label="成员名称" width="200" />
                <el-table-column label="显示名称" width="200">
                    <template #default="scope">
                        {{ getDisplayName(scope.row) }}
                    </template>
                </el-table-column>
                <el-table-column prop="value" label="值" width="100" />
                <el-table-column label="描述">
                    <template #default="scope">
                        {{ getDescription(scope.row) }}
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
    data: any // 接收 EnumType 的 JSON 对象
}

const props = defineProps<Props>()
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

// 提取 Description 的工具函数
const getDescription = (item: any): string => {
    if (!item.annotation || !Array.isArray(item.annotation)) return ''
    const found = item.annotation.find((a: any) => a.term === 'PaaS.Description')
    if (found && found.string && found.string[0]) {
        return found.string[0].text
    }
    return ''
}
</script>

<style scoped>
.enum-detail {
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

.enum-name {
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
</style>
