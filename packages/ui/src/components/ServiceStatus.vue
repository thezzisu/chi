<template>
  <q-chip
    text-color="white"
    :color="status[0]"
    :icon="status[1]"
    :label="status[2]"
    :clickable="false"
    :ripple="false"
    dense
    square
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ServiceState } from '@chijs/app'

const props = defineProps<{ state?: ServiceState }>()
const status = computed(() => {
  switch (props.state) {
    case 'failed':
      return ['negative', 'mdi-alert-circle', 'Failed']
    case 'running':
      return ['positive', 'mdi-play', 'Running']
    case 'starting':
      return ['secondary', 'mdi-play', 'Starting']
    case 'stopping':
      return ['secondary', 'mdi-stop', 'Stopping']
    case 'exited':
      return ['grey-9', 'mdi-stop', 'Exited']
    default:
      return ['black', 'mdi-timer-sand-empty', 'Loading']
  }
})
</script>
