<template>
  <q-layout view="hHh Lpr lff">
    <app-header>
      <q-toolbar class="bg-blue-grey-10">
        <q-toolbar-title>Environment Manager</q-toolbar-title>
      </q-toolbar>
    </app-header>

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
import { provide } from 'vue'
import AppHeader from 'src/components/AppHeader.vue'

const base = '/'
provide(baseKey, base)
</script>
