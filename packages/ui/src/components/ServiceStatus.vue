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
import { ServiceState } from '@chijs/client'
import { computed } from 'vue'

const props = defineProps<{ state?: ServiceState }>()
const status = computed(() => {
  switch (props.state) {
    case ServiceState.FAILED:
      return ['negative', 'mdi-alert-circle', 'Failed']
    case ServiceState.RUNNING:
      return ['positive', 'mdi-play', 'Running']
    case ServiceState.STARTING:
      return ['secondary', 'mdi-play', 'Starting']
    case ServiceState.STOPPING:
      return ['secondary', 'mdi-stop', 'Stopping']
    case ServiceState.STOPPED:
      return ['grey-9', 'mdi-stop', 'Stopped']
    default:
      return ['black', 'mdi-timer-sand-empty', 'Loading']
  }
})
</script>
