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
      { path: 'plugin', component: () => import('src/pages/PluginsPage.vue') },
      {
        path: 'load-plugin',
        component: () => import('src/pages/LoadPlugin.vue')
      },
      {
        path: 'plugin/:pluginId',
        component: () => import('src/pages/PluginPage.vue')
      },
      {
        path: 'service',
        component: () => import('src/pages/ServicesPage.vue')
      },
      {
        path: 'service/:serviceId',
        component: () => import('src/pages/ServicePage.vue')
      },
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
