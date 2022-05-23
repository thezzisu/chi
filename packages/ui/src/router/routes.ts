import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/InstanceManagerLayout.vue'),
    children: [
      { path: '', component: () => import('pages/InstanceManager.vue') }
    ]
  },
  {
    path: '/edit',
    component: () => import('src/layouts/InstanceManagerLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/InstanceEditor.vue') }
    ]
  },
  {
    path: '/edit/:id',
    component: () => import('src/layouts/InstanceManagerLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/InstanceEditor.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
