<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated class="row no-wrap">
      <q-toolbar class="col-auto bg-brand q-px-none">
        <q-btn stretch flat no-caps to="/" :icon="`img:${logoWhite}`" />
      </q-toolbar>
      <q-toolbar>
        <q-toolbar-title>Instance Manager</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
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
