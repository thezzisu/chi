<template>
  <q-card>
    <q-card-section>
      <div class="row justify-between items-center">
        <div>
          <div class="text-h6">Job Info</div>
          <job-status :state="job.state" />
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <q-list>
      <q-item>
        <q-item-section avatar>
          <q-icon name="mdi-identifier" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>ID</q-item-label>
          <q-item-label>
            {{ props.job.id }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-icon name="mdi-cog-outline" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Service</q-item-label>
          <q-item-label>
            {{ props.job.serviceId }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-icon name="mdi-play-outline" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Action</q-item-label>
          <q-item-label>
            {{ props.job.actionId }}
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
            {{ new Date(job.created).toLocaleString() }}
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
            {{ new Date(job.finished).toLocaleString() }}
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
import { IJobInfo } from '@chijs/client'
import JobStatus from 'components/JobStatus.vue'

const props = defineProps<{ job: IJobInfo }>()
</script>
