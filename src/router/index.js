// import { createRouter, createWebHistory } from 'vue-router'
import { createRouter, createWebHistory } from '@ionic/vue-router'
// import HomeView from '../views/HomeView.vue'
import GasStationsView from '../views/GasStationsView.vue'
import TestPageView from '../views/TestPageView.vue'
import MobileGasStationsView from '../views/MobileGasStationsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect:{
        name: 'stations'
      }
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // },
    {
      path: '/test-page',
      name: 'test-page',
      component: TestPageView
    },
    {
      path: '/stations',
      name: 'stations',
      component: GasStationsView
      // component: () => import('../views/GasStationsView.vue')
    },
    {
      path: '/mobile-stations',
      name: 'mobile-stations',
      component: MobileGasStationsView
    }
  ]
})

export default router
