import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import GasStationsView from '../views/GasStationsView.vue'
import TestPageView from '../views/TestPageView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    redirect: { name: 'stations' }
  },
  {
    path: '/test-page',
    name: 'test-page',
    component: TestPageView
  },
  {
    path: '/stations',
    name: 'stations',
    component: GasStationsView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
