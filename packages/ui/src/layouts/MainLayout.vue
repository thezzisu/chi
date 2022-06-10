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
          <code>{{ statusText }}</code>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script lang="ts" setup>
import { baseKey } from 'src/shared/injections'
import { getInstance } from 'src/shared/instance'
import { provide, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import DisconnectedPage from 'src/pages/DisconnectedPage.vue'
import { useClient } from 'src/shared/client'
import AppHeader from 'src/components/AppHeader.vue'

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
