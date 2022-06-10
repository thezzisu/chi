<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div class="text-h6">Tasks ({{ tasks.length }})</div>
          </div>
        </q-card-section>
        <q-separator />
        <q-list>
          <q-item v-for="task of tasks" :key="task.id">
            <q-item-section>
              <q-item-label>
                {{ task.serviceId }} / {{ task.actionId }}
              </q-item-label>
              <q-item-label caption class="text-mono">
                {{ task.id }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                :to="`${base}/task/view/${task.id}`"
                icon="mdi-eye"
                round
                flat
                dense
              />
            </q-item-section>
          </q-item>
        </q-list>
        <q-item v-if="!tasks.length" class="column items-center">
          <div>
            <q-icon name="mdi-cog-off-outline" size="xl" color="primary" />
          </div>
          <div class="text-subtitle2">No tasks</div>
        </q-item>
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
  tasks.value = await client.task.list()
}

load()
</script>
