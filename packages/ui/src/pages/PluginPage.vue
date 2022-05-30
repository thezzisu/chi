<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section class="flex-break">
          id: {{ plugin?.id }}
        </q-card-section>
        <q-card-section class="flex-break">
          params: {{ plugin?.params }}
        </q-card-section>
        <q-card-section class="flex-break">
          {{ plugin?.resolved }}
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { IPluginInfo } from '@chijs/client'
import { useRoute } from 'vue-router'
import { getClient } from 'src/shared/client'

const route = useRoute()
const pluginId = <string>route.params.pluginId
const client = getClient()
const plugin = ref<IPluginInfo>()

async function load() {
  plugin.value = await client.plugin.get(pluginId)
}

load()
</script>
