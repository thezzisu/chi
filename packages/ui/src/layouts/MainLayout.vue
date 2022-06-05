<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated class="row no-wrap">
      <q-toolbar class="col-auto bg-brand q-px-none">
        <q-btn
          flat
          round
          dense
          icon="mdi-menu"
          class="q-mx-sm"
          @click="navOpen = !navOpen"
        />
        <q-separator dark vertical inset />
        <q-btn stretch flat no-caps :to="base" :icon="`img:${logoWhite}`" />
      </q-toolbar>
      <q-toolbar class="bg-blue-grey-10">
        <q-toolbar-title>Dashboard</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="navOpen"
      class="bg-grey-3"
      side="left"
      show-if-above
      :width="170"
      :breakpoint="500"
    >
      <q-list>
        <q-item
          v-for="(item, i) of menuItems"
          :key="i"
          :to="`${base}${item.to}`"
          exact
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view v-if="connected" v-slot="{ Component }">
        <transition name="router" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      <disconnected-page v-else :message="message" />
    </q-page-container>

    <q-footer
      elevated
      class="text-white"
      :class="[connected ? 'bg-grey-8' : 'bg-red-8']"
    >
      <div class="row justify-center">
        <div>
          <code>{{ statusText }}</code>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script lang="ts" setup>
import logoWhite from 'assets/logo-white.svg'
import { baseKey } from 'src/shared/injections'
import { getInstance } from 'src/shared/instance'
import { provide, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import DisconnectedPage from 'src/pages/DisconnectedPage.vue'
import { useClient } from 'src/shared/client'

const navOpen = ref(false)

const route = useRoute()
const base = `/instance/${route.params.instanceId}`
provide(baseKey, base)

const menuItems = [
  { icon: 'mdi-clipboard-text-outline', label: 'Overview', to: '/' },
  { icon: 'mdi-power-plug-outline', label: 'Plugin', to: '/plugin' },
  { icon: 'mdi-cog-outline', label: 'Service', to: '/service' },
  { icon: 'mdi-play-outline', label: 'Action', to: '/action' },
  {
    icon: 'mdi-checkbox-multiple-blank-circle-outline',
    label: 'Task',
    to: '/task'
  }
]

const instance = getInstance(<string>route.params.instanceId)
const { connected, socket, message } = useClient(
  instance.value.url,
  instance.value.token
)
const statusText = computed(() => {
  if (connected.value) {
    return `Connected ${socket.id}`
  }
  return 'Disconnected'
})
</script>
