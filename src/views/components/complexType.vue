<template>
    <div class="complex-detail" v-if="data">
        <!-- 头部信息 -->
        <div class="header">
            <div class="title-row">
                <el-tag v-if="data.baseType" type="info" size="small">Base: {{ data.baseType }}</el-tag>
                <h2 class="complex-name">{{ data.name }}</h2>
                <span class="display-name">({{ getDisplayName(data) }})</span>
            </div>
            <div>
                <el-button type="primary" @click="visible = true" size="small">查看原始 JSON</el-button>
            </div>
        </div>

        <!-- 基础属性表格 -->
        <el-card class="section-card" shadow="never">
            <template #header>
                <div class="card-header"><span>基础属性 (Properties)</span></div>
            </template>
            <el-table :data="data.property" stripe style="width: 100%" border>
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

        <jsonViewerDialog v-model="visible" :data="data" />
    </div>
</template>

<script setup lang="ts">
import { Check, Close } from '@element-plus/icons-vue'
import jsonViewerDialog from './jsonViewerDialog.vue';
import { ref } from 'vue'

interface Props {
    data: any // 接收 ComplexType 的 JSON 对象
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
</script>

<style scoped>
.complex-detail {
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

.complex-name {
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
