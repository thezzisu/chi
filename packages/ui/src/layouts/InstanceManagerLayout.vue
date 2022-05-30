<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated class="row no-wrap">
      <q-toolbar class="col-auto bg-brand q-px-none">
        <q-btn stretch flat no-caps to="/" :icon="`img:${logoWhite}`" />
      </q-toolbar>
      <q-toolbar class="bg-blue-grey-10">
        <q-toolbar-title>Instance Manager</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="router" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import logoWhite from 'assets/logo-white.svg'
import { baseKey } from 'src/shared/injections'
import { provide } from 'vue'

const base = '/'
provide(baseKey, base)
</script>

<style lang="scss">
#my_header {
  background-color: rgb(49, 47, 47);
}
</style>
