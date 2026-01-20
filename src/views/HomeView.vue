<template>
    <div class="Home-page">
        <div class="side">
            <sideBar :rawSchemas="metadata1" @node-click="handleNodeClick"/>
        </div>
        <div class="main">
            <router-view></router-view>
        </div>

    </div>
</template>

<script setup lang="ts">
import { useODataStore } from '../store/odata'
import { useRouter } from 'vue-router'
import sideBar from './components/sideBar.vue'
import testXml from '../assets/metadata.xml?raw'
import * as odatajs from '../lib/odatajs/lib/odata.js';
import { ref, onMounted } from 'vue'

const metadata1 = ref([])

const handleNodeClick = (node) => {
    console.log(node)
    // router.push({
    //     path: '/entity',
    //     query: {
    //         entity: node.name
    //     }
    // })
}

onMounted(() => {
    const metadata = odatajs.parseMetadata(testXml)
    console.log(metadata.dataServices.schema)
    metadata1.value = metadata.dataServices.schema
})

const store = useODataStore()
const router = useRouter()

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
        background-color: aqua;
    }
}
</style>