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
import type { JobState } from '@chijs/app'
import { computed } from 'vue'

const props = defineProps<{ state?: JobState }>()
const status = computed(() => {
  switch (props.state) {
    case 'running':
      return ['warning', 'mdi-play', 'Running']
    case 'success':
      return ['positive', 'mdi-check', 'Success']
    case 'failed':
      return ['negative', 'mdi-close', 'Failed']
    default:
      return ['black', 'mdi-timer-sand-empty', 'Loading']
  }
})
</script>
