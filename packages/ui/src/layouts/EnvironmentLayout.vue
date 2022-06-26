<template>
  <q-layout view="hHh Lpr lff">
    <app-header v-model:nav="navOpen">
      <q-toolbar class="bg-blue-grey-10">
        <q-toolbar-title>Environment Manager</q-toolbar-title>
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
        <q-item v-for="(item, i) of menu" :key="i" :to="item.to" exact>
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
          <router-view v-slot="{ Component }">
            <transition name="router" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { baseKey } from 'src/shared/injections'
import { provide, ref } from 'vue'
import AppHeader from 'src/components/AppHeader.vue'

const navOpen = ref(false)

const menu = [
  { icon: 'mdi-clipboard-text', label: 'Overview', to: '/' },
  {
    icon: 'mdi-application-cog-outline',
    label: 'Settings',
    to: '/settings'
  }
]

const base = '/'
provide(baseKey, base)
</script>
