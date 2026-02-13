import { createRouter, createWebHashHistory } from 'vue-router'
import ODataWorkbench from '../views/ODataWorkbench.vue'

const routes = [
  {
    path: '/',
    component: ODataWorkbench,
  },
  {
    path: '/settings',
    redirect: '/',
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
