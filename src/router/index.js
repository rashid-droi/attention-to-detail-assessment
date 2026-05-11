import { createRouter, createWebHashHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HelloWorld
  },
  {
    path: '/result',
    name: 'assessment-result',
    component: () => import('../components/AssessmentResult.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
