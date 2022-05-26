<template>
  <q-layout view="lHh LpR lFf">
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
      <q-toolbar>
        <q-toolbar-title>Dashboard</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="navOpen" side="left" show-if-above bordered>
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
      <router-view v-slot="{ Component }">
        <transition name="router" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
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
import { ChiClient } from '@chijs/client'
import { baseKey, clientKey } from 'src/shared/injections'
import { getInstance } from 'src/shared/instance'
import { provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import { computed } from '@vue/reactivity'

const navOpen = ref(false)

const route = useRoute()
const base = `/instance/${route.params.instanceId}`
provide(baseKey, base)

const menuItems = [
  { icon: 'mdi-clipboard-text-outline', label: 'Overview', to: '/' },
  { icon: 'mdi-power-plug-outline', label: 'Plugin', to: '/plugin' },
  { icon: 'mdi-cog-outline', label: 'Service', to: '/service' }
]

const instance = getInstance(<string>route.params.instanceId)

const client = new ChiClient(instance.value.url)
const connected = ref(false)
provide(clientKey, client)
client.socket.on('connect', () => {
  connected.value = true
})
client.socket.on('disconnect', () => {
  connected.value = false
})
const statusText = computed(() => {
  if (connected.value) {
    return `Connected ${client.socket.id}`
  }
  return 'Disconnected'
})
</script>
