<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          {{ plugin }}
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { clientKey } from 'src/shared/injections'
import { inject, ref } from 'vue'
import { IPluginInfo } from '@chijs/client'
import { useRoute } from 'vue-router'

const route = useRoute()
const pluginId = <string>route.params.pluginId
const client = inject(clientKey)!
const plugin = ref<IPluginInfo>()

async function load() {
  plugin.value = await client.plugin.get(pluginId)
}

load()
</script>
