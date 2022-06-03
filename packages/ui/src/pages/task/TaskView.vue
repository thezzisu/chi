<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        {{ base }}
        <q-card-section>
          <pre>{{ JSON.stringify(task, null, '  ') }}</pre>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { inject, ref } from 'vue'
import { ITaskInfo } from '@chijs/client'
import { useRoute } from 'vue-router'
import { getClient } from 'src/shared/client'
import { baseKey } from 'src/shared/injections'

const base = inject(baseKey)
const route = useRoute()
const taskId = <string>route.params.taskId
const client = getClient()
const task = ref<ITaskInfo>()

async function load() {
  task.value = await client.action.getTask(taskId)
}

load()
</script>
