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
    overflow: hidden;
    background-color: rgb(247, 247, 247);
    padding: 10px;
  }
}
</style>