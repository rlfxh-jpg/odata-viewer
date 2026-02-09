<template>
    <el-dialog v-model="visible" title="原始元数据 JSON 视图" width="80%" top="5vh" draggable destroy-on-close
        class="json-dialog">
        <div class="json-content-wrapper">
            <!-- JSON 查看器核心 -->
            <json-viewer :value="jsonData" :expand-depth="2" copyable  sort theme="light" />
        </div>

        <template #footer>
            <el-button @click="visible = false">关闭</el-button>
            <el-button type="primary" @click="copyToClipboard">复制全文</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { JsonViewer } from "vue3-json-viewer"
// import "vue3-json-viewer/dist/index.css"
import { ElMessage } from 'element-plus'

const props = defineProps<{
    modelValue: boolean,
    data: any
}>()

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
const jsonData = ref(props.data)

// 同步父组件的开关状态
watch(() => props.modelValue, (val) => visible.value = val)
watch(() => visible.value, (val) => emit('update:modelValue', val))

// 同步数据
watch(() => props.data, (val) => jsonData.value = val)

// 复制功能
const copyToClipboard = () => {
    const text = JSON.stringify(jsonData.value, null, 2)
    navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
}
</script>

<style scoped>
.json-content-wrapper {
    /* 设置最大高度，防止大 JSON 撑破屏幕，并开启滚动 */
    max-height: 70vh;
    overflow-y: auto;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background-color: #f9f9f9;
}

/* 优化查看器字体 */
:deep(.jv-container) {
    font-family: 'Fira Code', 'Consolas', monospace;
}
</style>