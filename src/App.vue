<template>
  <div class="app-wrapper">
    <div class="header">
      <el-menu mode="horizontal" router :default-active="$route.path">
        <el-menu-item index="/">主页</el-menu-item>
        <el-menu-item index="/settings">设置</el-menu-item>
      </el-menu>
    </div>
    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style scoped lang="less">
.app-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .header {
    height: 40px;
    width: 100%;

    :deep(.el-menu--horizontal) {
      height: 40px;
    }
  }

  .main {
    flex: 1;
    overflow: auto;
    padding: 20px;
  }
}
</style>