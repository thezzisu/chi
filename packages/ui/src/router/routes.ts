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
      {
        path: 'plugin',
        component: () => import('src/pages/plugin/PluginList.vue')
      },
      {
        path: 'plugin/load',
        component: () => import('src/pages/plugin/PluginLoad.vue')
      },
      {
        path: 'plugin/view/:pluginId',
        component: () => import('src/pages/plugin/PluginView.vue')
      },
      {
        path: 'unit',
        component: () => import('src/pages/unit/UnitList.vue')
      },
      {
        path: 'unit/view/:pluginId/:unitId',
        component: () => import('src/pages/unit/UnitView.vue')
      },
      {
        path: 'service',
        component: () => import('src/pages/service/ServiceList.vue')
      },
      {
        path: 'service/view/:serviceId',
        component: () => import('src/pages/service/ServiceView.vue')
      },
      {
        path: 'action',
        component: () => import('src/pages/action/ActionList.vue')
      },
      {
        path: 'action/view/:pluginId/:actionId',
        component: () => import('src/pages/action/ActionView.vue')
      },
      {
        path: 'task',
        component: () => import('src/pages/task/TaskList.vue')
      },
      {
        path: 'task/view/:taskId',
        component: () => import('src/pages/task/TaskView.vue')
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
