<template>
    <div class="term-detail" v-if="data">
        <!-- 头部信息 -->
        <div class="header">
            <div class="title-row">
                <h2 class="term-name">{{ data.name }}</h2>
                <span class="display-name">({{ getDisplayName(data) }})</span>
            </div>
            <div>
                <el-button type="primary" @click="visible = true" size="small">查看原始 JSON</el-button>
            </div>
        </div>

        <!-- 基本信息 -->
        <el-card class="section-card" shadow="never">
            <template #header>
                <div class="card-header"><span>基本信息</span></div>
            </template>
            <el-descriptions :column="1" border>
                <el-descriptions-item label="名称">{{ data.name }}</el-descriptions-item>
                <el-descriptions-item label="类型">
                    <code class="type-code">{{ data.type }}</code>
                </el-descriptions-item>
                <el-descriptions-item label="应用范围" v-if="data.appliesTo">
                    <el-tag v-for="scope in appliesToArray" :key="scope" type="info" size="small" style="margin-right: 5px;">
                        {{ scope }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="基础 Term" v-if="data.baseTerm">
                    <el-link type="primary" @click="handleJump(data.baseTerm)">
                        {{ data.baseTerm }}
                    </el-link>
                </el-descriptions-item>
                <el-descriptions-item label="默认值" v-if="data.defaultValue">
                    <code class="type-code">{{ data.defaultValue }}</code>
                </el-descriptions-item>
                <el-descriptions-item label="描述">
                    {{ getDescription(data) }}
                </el-descriptions-item>
            </el-descriptions>
        </el-card>

        <jsonViewerDialog v-model="visible" :data="data" />
    </div>
</template>

<script setup lang="ts">
import jsonViewerDialog from './jsonViewerDialog.vue';
import { computed, ref } from 'vue'

interface Props {
    data: any // 接收 Term 的 JSON 对象
}

const props = defineProps<Props>()
const emit = defineEmits(['jump'])
const visible = ref(false)

// 处理 appliesTo（可能是字符串或数组）
const appliesToArray = computed(() => {
    if (!props.data.appliesTo) return []
    return Array.isArray(props.data.appliesTo) ? props.data.appliesTo : [props.data.appliesTo]
})

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

// 处理点击类型跳转
const handleJump = (fullTypeName: string) => {
    const typeName = fullTypeName.split('.').pop()
    emit('jump', typeName)
}
</script>

<style scoped>
.term-detail {
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

.term-name {
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
