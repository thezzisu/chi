<template>
  <q-card>
    <q-card-section>
      <div class="row justify-between items-center">
        <div>
          <div class="text-h6">Job Details</div>
          <div class="text-mono">{{ job?.id }}</div>
        </div>
        <job-status :state="job.state" />
      </div>
    </q-card-section>
    <q-separator />
    <simple-list :items="items" />
    <q-separator />
    <q-card-section>
      <div class="text-subtitle2">Params</div>
      <json-block :data="props.job.params" />
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="text-subtitle2">Return</div>
      <json-block :data="props.job.return" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { IJobInfo } from '@chijs/app'
import JobStatus from 'components/JobStatus.vue'
import JsonBlock from 'components/JsonBlock'
import SimpleList, { ISimpleListItem } from 'components/SimpleList'
import { baseKey } from 'src/shared/injections'
import { computed, inject } from 'vue'

const base = inject(baseKey)
const props = defineProps<{ job: IJobInfo }>()
const items = computed<ISimpleListItem[]>(() => [
  {
    icon: 'mdi-power-plug',
    caption: 'Plugin',
    label: props.job.pluginId,
    labelTo:
      `${base}/plugin/view/` + encodeURIComponent('' + props.job?.pluginId)
  },
  {
    icon: 'mdi-checkbox-blank-circle-outline',
    caption: 'Action',
    label: props.job.actionId,
    labelTo:
      `${base}/action/view/` +
      encodeURIComponent('' + props.job?.pluginId) +
      '/' +
      encodeURIComponent('' + props.job?.actionId)
  },
  {
    icon: 'mdi-clock-plus-outline',
    caption: 'Created',
    label: new Date(props.job.created).toLocaleString()
  },
  {
    icon: 'mdi-clock-minus-outline',
    caption: 'Finished',
    label: new Date(props.job.finished).toLocaleString()
  }
])
</script>
