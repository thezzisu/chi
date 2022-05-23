<template>
  <q-layout view="lHh LpR lFf">
    <q-header elevated class="row no-wrap">
      <q-toolbar class="col-auto bg-purple q-px-none">
        <q-btn
          flat
          round
          dense
          icon="mdi-menu"
          class="q-mx-sm"
          @click="navOpen = !navOpen"
        />
        <q-separator dark vertical inset />
        <q-btn stretch flat no-caps :to="base">
          <q-toolbar-title>ChiUI</q-toolbar-title>
        </q-btn>
      </q-toolbar>
      <q-toolbar>
        <q-toolbar-title>Dashboard</q-toolbar-title>
        <q-btn
          flat
          round
          dense
          :icon="`mdi-${
            connected ? 'check-network-outline' : 'close-network-outline'
          }`"
        />
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
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { ChiClient } from '@chijs/client'
import { clientKey } from 'src/shared/injections'
import { getInstance } from 'src/shared/instance'
import { provide, ref } from 'vue'
import { useRoute } from 'vue-router'

const navOpen = ref(false)

const route = useRoute()
const base = `/instance/${route.params.instanceId}`

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
</script>
