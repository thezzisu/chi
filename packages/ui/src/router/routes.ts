import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/InstanceManagerLayout.vue'),
    children: [
      { path: '', component: () => import('pages/InstanceManager.vue') }
    ]
  },
  {
    path: '/edit',
    component: () => import('layouts/InstanceManagerLayout.vue'),
    children: [
      { path: '', component: () => import('pages/InstanceEditor.vue') }
    ]
  },
  {
    path: '/edit/:id',
    component: () => import('layouts/InstanceManagerLayout.vue'),
    children: [
      { path: '', component: () => import('pages/InstanceEditor.vue') }
    ]
  },
  {
    path: '/instance/:instanceId',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'plugin', component: () => import('pages/PluginPage.vue') },
      { path: 'service', component: () => import('pages/ServicePage.vue') },
      {
        path: ':catchAll(.+)',
        component: () => import('pages/ErrorNotFound.vue')
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
