import { createRouter, createWebHashHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HelloWorld,
    meta: { integratedSiteHeader: true }
  },
  {
    path: '/result',
    name: 'assessment-result',
    component: () => import('../components/AssessmentResult.vue'),
    meta: { integratedSiteHeader: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, left: 0, behavior: 'auto' }
  }
})

export default router
