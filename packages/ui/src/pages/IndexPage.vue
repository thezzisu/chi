<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="text-h6">Server Status</div>
        </q-card-section>
        <q-separator />
        <q-list>
          <q-item v-for="(info, i) of infos" :key="i">
            <q-item-section>
              <q-item-label>{{ info.label }}</q-item-label>
              <q-item-label caption>{{ info.content }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { inject, ref } from 'vue'
import { clientKey } from 'src/shared/injections'

interface Info {
  label: string
  content: string
}

const infos = ref<Info[]>([])

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const client = inject(clientKey)!

async function load() {
  const versions = await client.misc.versions()
  infos.value.push({
    label: 'Server Version',
    content: versions.server
  })
  const startTime = await client.misc.startTime()
  infos.value.push({
    label: 'Start Time',
    content: new Date(startTime).toLocaleString()
  })
  const plugins = await client.plugin.list()
  infos.value.push({
    label: 'Loaded Plugins',
    content: '' + plugins.length
  })
  const services = await client.service.list()
  infos.value.push({
    label: 'All Services',
    content: `Running: ${services.filter((s) => s.running).length} Total: ${
      services.length
    }`
  })
}

load()
</script>
