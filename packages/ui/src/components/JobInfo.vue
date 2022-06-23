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
    <q-list>
      <q-item>
        <q-item-section avatar>
          <q-icon name="mdi-power-plug" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Plugin</q-item-label>
          <q-item-label>
            <router-link :to="urlPlugin">
              {{ props.job?.pluginId }}
            </router-link>
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-icon name="mdi-checkbox-blank-circle-outline" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Action</q-item-label>
          <q-item-label>
            <router-link :to="actionUrl">
              {{ props.job?.actionId }}
            </router-link>
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-icon name="mdi-clock-plus-outline" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Created</q-item-label>
          <q-item-label>
            {{ new Date(props.job.created).toLocaleString() }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-icon name="mdi-clock-minus-outline" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Finished</q-item-label>
          <q-item-label>
            {{ new Date(props.job.finished).toLocaleString() }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator />
    <q-card-section>
      <div class="text-subtitle2">Params</div>
      <pre>{{ JSON.stringify(props.job.params, null, '  ') }}</pre>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="text-subtitle2">Return</div>
      <pre>{{ JSON.stringify(props.job.return, null, '  ') }}</pre>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { IJobInfo } from '@chijs/app'
import JobStatus from 'components/JobStatus.vue'
import { baseKey } from 'src/shared/injections'
import { computed, inject } from 'vue'

const base = inject(baseKey)
const props = defineProps<{ job: IJobInfo }>()

const urlPlugin = computed(
  () => `${base}/plugin/view/` + encodeURIComponent('' + props.job?.pluginId)
)

const actionUrl = computed(
  () =>
    `${base}/action/view/` +
    encodeURIComponent('' + props.job?.pluginId) +
    '/' +
    encodeURIComponent('' + props.job?.actionId)
)
</script>
