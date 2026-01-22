<template>
    <div class="Home-page">
        <div class="side">
            <sideBar :tree-data="treeData" @node-click="handleNodeClick" />
        </div>
        <div class="main">
            <!-- <router-view></router-view> -->
             <entityType :data="pannelData"/>
        </div>

    </div>
</template>

<script setup lang="ts">
import { useODataStore } from '../store/odata'
import sideBar from './components/sideBar.vue'
import entityType from './components/entityType.vue'

import { ref, onMounted } from 'vue'

const treeData = ref([])
const store = useODataStore()
const pannelData = ref([])

const handleNodeClick = (node: any) => {
    if(node.type =='category'||node.type =='namespace')return
    pannelData.value = node.data
    console.log(node.data)
}

onMounted(async () => {
    await store.connect()
    treeData.value = store.treeData
})



</script>
<style lang="less" scoped>
.Home-page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    background-color: rgb(255, 255, 255);
    border-radius: 10px;

    .side {
        width: 300px;
        height: 100%;
        padding: 3px;
        overflow: auto;
        overflow-y: auto;
    }

    .main {
        flex: 1;
        overflow: auto;
        // background-color: aqua;
    }
}
</style>