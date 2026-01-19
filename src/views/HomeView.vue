<template>
    <div class="settings-page">
        <h3>OData 配置</h3>
        <el-form label-position="top">
            <el-form-item label="Metadata URL">
                <el-input v-model="store.odataUrl" placeholder="输入地址">
                    <template #append>
                        <el-button @click="handleConnect" :loading="store.loading">12222222222222测试并连接</el-button>
                    </template>
                </el-input>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { useODataStore } from '../store/odata'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const store = useODataStore()
const router = useRouter()

const handleConnect = async () => {
    const success = await store.connect()
    if (success) {
        ElMessage.success('连接成功！')
        router.push('/') // 连接成功自动跳回主页
    } else {
        ElMessage.error('连接失败，请检查 URL')
    }
}
</script>