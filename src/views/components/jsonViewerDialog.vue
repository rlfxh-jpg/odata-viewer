<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="80%"
    top="5vh"
    draggable
    destroy-on-close
    class="json-dialog"
  >
    <div class="json-content-wrapper">
      <json-viewer :value="jsonValue" :expand-depth="2" copyable sort theme="light" />
    </div>

    <template #footer>
      <el-button @click="visible = false">Close</el-button>
      <el-button type="primary" @click="copyToClipboard">Copy</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { JsonViewer } from 'vue3-json-viewer'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  data: unknown
  title?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    visible.value = value
  },
)

watch(
  () => visible.value,
  (value) => {
    emit('update:modelValue', value)
  },
)

const dialogTitle = computed(() => props.title || 'Raw JSON')
const jsonValue = computed(() => props.data ?? null)

const copyToClipboard = async () => {
  const text = JSON.stringify(jsonValue.value, null, 2)
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('Copied to clipboard')
  } catch {
    ElMessage.error('Copy failed')
  }
}
</script>

<style scoped>
.json-content-wrapper {
  max-height: 70vh;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f9f9f9;
}

:deep(.jv-container) {
  font-family: 'Fira Code', 'Consolas', monospace;
}
</style>
