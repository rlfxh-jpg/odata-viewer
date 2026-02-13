<template>
    <div class="function-import-detail" v-if="data">
        <!-- 头部信息 -->
        <div class="header">
            <div class="title-row">
                <h2 class="import-name">{{ data.name }}</h2>
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
                <el-descriptions-item label="导入名称">{{ data.name }}</el-descriptions-item>
                <el-descriptions-item label="关联 Function">
                    <el-link type="primary" @click="handleJump(data.function)">
                        {{ data.function }}
                    </el-link>
                </el-descriptions-item>
                <el-descriptions-item label="绑定实体集" v-if="data.entitySet">
                    <el-link type="primary" @click="handleJump(data.entitySet)">
                        {{ data.entitySet }}
                    </el-link>
                </el-descriptions-item>
            </el-descriptions>
        </el-card>

        <jsonViewerDialog v-model="visible" :data="data" />
    </div>
</template>

<script setup lang="ts">
import jsonViewerDialog from './jsonViewerDialog.vue';
import { ref } from 'vue'

interface Props {
    data: any // 接收 FunctionImport 的 JSON 对象
}

const props = defineProps<Props>()
const emit = defineEmits(['jump'])
const visible = ref(false)

// 处理点击类型跳转
const handleJump = (fullTypeName: string) => {
    const typeName = fullTypeName.split('.').pop()
    emit('jump', typeName)
}
</script>

<style scoped>
.function-import-detail {
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

.import-name {
    margin: 0;
    color: #303133;
    font-size: 20px;
}

.section-card {
    border: 1px solid #ebeef5;
}

.card-header {
    font-weight: bold;
    color: #409EFF;
}
</style>
