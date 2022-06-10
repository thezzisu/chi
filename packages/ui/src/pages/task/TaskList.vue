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
          <q-item
            v-for="task of tasks"
            :key="task.id"
            class="q-pa-xs col-6 col-xl-1"
          >
            <q-item-section>
              <q-item-label>{{ task.id }} : {{ task.serviceId }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                :to="`${base}/task/view/${task.id}`"
                icon="mdi-eye"
                round
                flat
                dense
                color="black"
              />
            </q-item-section>
            <q-item-section side>
              <q-btn
                icon="mdi-delete"
                round
                flat
                dense
                color="black"
                @click="remove"
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
import { useQuasar } from 'quasar'

const client = getClient()
const base = inject(baseKey)

const tasks = ref<ITaskInfo[]>([])
const $q = useQuasar()

function remove() {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure to delete ?',
    cancel: true,
    persistent: true
  }).onOk(() => {

    $q.notify({
      message: 'Task Deleted',
      color: 'positive'
    })

  })
}

async function load() {
  tasks.value = await client.action.listTask()
}

load()
</script>
