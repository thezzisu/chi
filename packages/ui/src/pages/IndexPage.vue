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
import { ref } from 'vue'
import { getClient } from 'src/shared/client'

interface Info {
  label: string
  content: string
}

const infos = ref<Info[]>([])

const client = getClient()

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
}

load().catch(console.error)
</script>
