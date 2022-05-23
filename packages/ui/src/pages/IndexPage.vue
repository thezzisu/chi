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
  const versions = await client.hub.call('app:versions', [])
  infos.value.push({
    label: 'Server version',
    content: versions.server
  })
}

load()
</script>
