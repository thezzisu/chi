<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div>
              <div class="text-h6">Plugin {{ plugin?.id }}</div>
            </div>
          </div>
          <q-separator />
        </q-card-section>
        <q-list>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-cog" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Name</q-item-label>
              <q-item-label>{{
                plugin?.name === undefined ? plugin?.id : plugin.name
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-text-box" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Desc</q-item-label>
              <q-item-label>{{
                plugin?.desc === undefined ? no_desc : plugin.desc
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-text-box" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Resolved</q-item-label>
              <q-item-label>{{ plugin?.resolved }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator />
        <q-card-section>
          <div class="text-subtitle-1">Parameters</div>
          <pre>{{ JSON.stringify(plugin?.params, null, '  ') }}</pre>
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
const no_desc = ref('No description')

async function load() {
  plugin.value = await client.plugin.get(pluginId)
}

load()
</script>
