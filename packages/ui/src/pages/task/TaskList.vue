<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div class="text-h6">Tasks ({{ tasks.length }})</div>
            <div>
              <q-btn
                padding="xs"
                color="primary"
                icon="mdi-play"
                :to="`${base}/task/add`"
              />
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section v-if="tasks.length" class="row">
          <div
            v-for="task of tasks"
            :key="task.id"
            class="q-pa-xs col-6 col-xl-1"
          >
            <q-card>
              <q-card-section>{{ task.id }}</q-card-section>
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label>{{ task.serviceId }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-card-actions align="right">
                <q-btn :to="`${base}/task/view/${task.id}`" label="View" />
              </q-card-actions>
            </q-card>
          </div>
        </q-card-section>
        <q-card-section v-else class="column items-center">
          <div>
            <q-icon name="mdi-cog-off-outline" size="xl" color="primary" />
          </div>
          <div class="text-subtitle2">No tasks</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { baseKey } from 'src/shared/injections'
import { inject, ref } from 'vue'
import { ITaskInfo } from '@chijs/client'
import { getClient } from 'src/shared/client'

const client = getClient()
const base = inject(baseKey)

const tasks = ref<ITaskInfo[]>([])

async function load() {
  tasks.value = await client.action.listTask()
}

load()
</script>
