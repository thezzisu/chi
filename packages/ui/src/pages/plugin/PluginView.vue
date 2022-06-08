<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12 col-lg-6">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div>
              <div class="text-h6">Plugin {{ plugin?.id }}</div>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-list>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-cog" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Name</q-item-label>
              <q-item-label>
                {{ plugin?.name === undefined ? plugin?.id : plugin.name }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-text-box" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Desc</q-item-label>
              <q-item-label>
                {{ plugin?.desc === undefined ? no_desc : plugin.desc }}
              </q-item-label>
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
        <schema-viewer
          :schema="plugin?.params ?? { type: 'object' }"
          name="Parameters"
        />
      </q-card>
    </div>
    <div class="q-pa-sm col-12 col-lg-6">
      <service-create :plugin-id="pluginId" :schema="plugin?.params" />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { IPluginInfo } from '@chijs/client'
import { useRoute } from 'vue-router'
import { getClient } from 'src/shared/client'
import SchemaViewer from 'components/json/viewer/SchemaViewer.vue'
import ServiceCreate from 'components/ServiceCreate.vue'

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
