<template>
  <q-page padding class="row content-start justify-center">
    <div class="q-pa-sm col-12 col-lg-6">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div>
              <div class="text-h6">Task Details</div>
              <div class="text-mono">{{ task?.id }}</div>
              <job-status :state="task?.state" />
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-list>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-cog" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Plugin</q-item-label>
              <q-item-label>
                <router-link :to="pluginUrl">
                  {{ task?.pluginId }}
                </router-link>
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
                <router-link :to="actionUrl">
                  {{ task?.actionId }}
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
                {{ new Date(task?.created ?? 0).toLocaleString() }}
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
                {{ new Date(task?.finished ?? 0).toLocaleString() }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator />
        <q-card-actions align="right">
          <async-btn
            :callback="remove"
            notify-success
            :btn-props="{
              color: 'negative',
              label: 'Remove'
            }"
          />
        </q-card-actions>
      </q-card>
    </div>
    <template v-if="task?.jobs.length">
      <div class="q-pa-sm col-12 col-lg-6">
        <q-card>
          <jobs-graph v-model="job" :jobs="task.jobs" />
        </q-card>
      </div>
    </template>
    <template v-if="job">
      <div class="q-pa-sm col-12">
        <job-info :job="job" />
      </div>
    </template>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, ref } from 'vue'
import type { IJobInfo, ActionTask } from '@chijs/app'
import { useRoute, useRouter } from 'vue-router'
import { getClient, baseKey, confirm } from 'src/shared'
import AsyncBtn from 'components/AsyncBtn.vue'
import JobStatus from 'components/JobStatus.vue'
import JobsGraph from 'components/JobsGraph.vue'
import JobInfo from 'components/JobInfo.vue'

const base = inject(baseKey)
const router = useRouter()
const route = useRoute()
const taskId = <string>route.params.taskId
const client = getClient()
const task = ref<ActionTask>()
const job = ref<IJobInfo>()

const pluginUrl = computed(
  () => `${base}/plugin/view/` + encodeURIComponent('' + task.value?.pluginId)
)

const actionUrl = computed(
  () =>
    `${base}/action/view/` +
    encodeURIComponent('' + task.value?.pluginId) +
    '/' +
    encodeURIComponent('' + task.value?.actionId)
)

async function remove() {
  await confirm('Are you sure you want to remove this task?')
  await client.task.remove(taskId)
  router.replace(`${base}/task`)
}

let sub: Promise<string> | null = null

function update(info: ActionTask) {
  task.value = info
  if (info.state !== 'running') unsub()
}

async function load() {
  const info = await client.task.get(taskId)
  update(info)
  if (info.state === 'running') {
    sub = client.server.subscribe(
      '#server:task:update',
      (info) => update(info),
      info.id
    )
  }
}

async function unsub() {
  if (sub) {
    sub.then((id) => client.server.unsubscribe(id))
    sub = null
  }
}

load()

onBeforeUnmount(() => {
  unsub()
})
</script>
