import { createApp } from 'vue'
import App from './AppRoot.vue'

import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import { router } from './router/index'
import './style.css'
// 方案 A: 尝试去掉 index (最常用修复方案)
import "vue3-json-viewer/dist/vue3-json-viewer.css"; 


const app = createApp(App)

app.use(ElementPlus)
app.use(createPinia())
app.use(router)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
