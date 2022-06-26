<template>
  <q-layout view="hHh Lpr lff">
    <app-header v-model:nav="navOpen">
      <q-toolbar class="bg-blue-grey-10">
        <q-toolbar-title>Dashboard</q-toolbar-title>
      </q-toolbar>
    </app-header>

    <q-drawer
      v-model="navOpen"
      class="bg-grey-3"
      side="left"
      show-if-above
      :width="220"
      :breakpoint="540"
    >
      <q-list>
        <q-item v-for="(item, i) of menu" :key="i" :to="base + item.to" exact>
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.label }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="showStop" clickable @click="stop">
          <q-item-section avatar>
            <q-icon name="mdi-stop-circle" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Stop</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="gotoManager">
          <q-item-section avatar>
            <q-icon name="mdi-arrow-left-circle" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Environments</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="abs-fit overflow-hidden">
      <div class="row no-wrap full-height overflow-auto scrollbar">
        <div class="col">
          <router-view v-if="connected" v-slot="{ Component }">
            <transition name="router" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
          <disconnected-page v-else :message="message" />
        </div>
      </div>
    </q-page-container>

    <q-footer
      elevated
      class="text-white"
      :class="[connected ? 'bg-grey-8' : 'bg-red-8']"
    >
      <div class="row justify-center">
        <div>
          <code>{{ status }}</code>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script lang="ts" setup>
import { baseKey } from 'src/shared/injections'
import { computed, provide, ref, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DisconnectedPage from 'src/pages/DisconnectedPage.vue'
import { useEnvironment } from 'src/shared/client'
import AppHeader from 'src/components/AppHeader.vue'
import { getEnvironment } from 'src/shared'

const navOpen = ref(false)

const route = useRoute()
const router = useRouter()
const base = `/environment/${route.params.environmentId}`
provide(baseKey, base)

const menu = [
  { icon: 'mdi-clipboard-text', label: 'Overview', to: '/' },
  { icon: 'mdi-power-plug', label: 'Plugin', to: '/plugin' },
  { icon: 'mdi-cog-outline', label: 'Unit', to: '/unit' },
  { icon: 'mdi-cogs', label: 'Service', to: '/service' },
  {
    icon: 'mdi-checkbox-blank-circle-outline',
    label: 'Action',
    to: '/action'
  },
  {
    icon: 'mdi-checkbox-multiple-blank-circle',
    label: 'Task',
    to: '/task'
  },
  {
    icon: 'mdi-application-cog-outline',
    label: 'Settings',
    to: '/settings'
  }
]

const envId = <string>route.params.environmentId
const showStop = computed(
  () => !!window.bridge && getEnvironment(envId).value.type === 'local'
)

function stop() {
  const info = toRaw(getEnvironment(envId).value)
  info.type === 'local' && window.bridge?.stopServer(info.config)
}

function gotoManager() {
  if (window.bridge?.open) {
    window.bridge.open('/')
  } else {
    window.open(router.resolve('/').href, '_blank')
  }
}

const { connected, status, message } = useEnvironment(envId)
</script>
