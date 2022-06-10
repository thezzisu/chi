<template>
  <q-header elevated>
    <q-bar
      v-if="isElectron"
      class="q-electron-drag row justify-between bg-brand"
    >
      <q-btn dense flat :icon="`img:${logoWhite}`" :to="base" />
      <div>ChiUI</div>
      <div class="row">
        <q-btn dense flat icon="mdi-window-minimize" @click="minimize" />
        <q-btn dense flat icon="mdi-window-maximize" @click="maximize" />
        <q-btn dense flat icon="mdi-window-close" @click="close" />
      </div>
    </q-bar>
    <div class="row no-wrap">
      <q-toolbar
        class="col-auto q-px-none"
        :class="{ 'bg-brand': !isElectron }"
      >
        <q-btn
          flat
          round
          dense
          icon="mdi-menu"
          class="q-mx-sm"
          @click="emit('update:nav', !props.nav)"
        />
        <template v-if="!isElectron">
          <q-separator dark vertical inset />
          <q-btn stretch flat no-caps :to="base" :icon="`img:${logoWhite}`" />
        </template>
      </q-toolbar>
      <slot></slot>
    </div>
  </q-header>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import logoWhite from 'assets/logo-white.svg'
import { baseKey } from 'src/shared/injections'
import { isElectron, minimize, maximize, close } from 'src/shared/bridge'

const props = defineProps<{
  nav?: boolean
}>()

const emit = defineEmits(['update:nav'])
const base = inject(baseKey)
</script>
