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
        <simple-list :items="list" />
        <q-separator />
        <description-view :desc="plugin?.meta.description" />
        <q-separator />
        <q-list>
          <q-expansion-item
            icon="mdi-application-variable-outline"
            label="Parameters Schema"
          >
            <q-card>
              <schema-viewer
                :schema="plugin?.params ?? { type: 'object' }"
                name="root"
              />
            </q-card>
          </q-expansion-item>
        </q-list>
        <q-separator />
        <q-list>
          <q-expansion-item icon="mdi-variable" label="Parameters">
            <q-card>
              <monaco-editor
                :model-value="JSON.stringify(plugin?.actualParams, null, '  ')"
                language="json"
                readonly
              />
            </q-card>
          </q-expansion-item>
        </q-list>
        <q-separator />
        <q-card-actions align="right">
          <async-btn
            :callback="remove"
            notify-success
            :btn-props="{
              color: 'negative',
              label: 'Unload'
            }"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import type { IPluginInfo } from '@chijs/app'
import AsyncBtn from 'components/AsyncBtn.vue'
import DescriptionView from 'components/DescriptionView.vue'
import SchemaViewer from 'components/json/viewer/SchemaViewer.vue'
import MonacoEditor from 'components/MonacoEditor'
import SimpleList, { ISimpleListItem } from 'components/SimpleList'
import { baseKey, confirm, getClient } from 'src/shared'
import { computed, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const pluginId = <string>route.params.pluginId
const client = getClient()
const plugin = ref<IPluginInfo>()
const base = inject(baseKey)

const list = computed<ISimpleListItem[]>(() => [
  {
    icon: 'mdi-identifier',
    caption: 'ID',
    label: plugin.value?.id
  },
  {
    icon: 'mdi-format-letter-case',
    caption: 'Name',
    label: plugin.value?.meta.name,
    hide: !plugin.value?.meta.name
  },
  {
    icon: 'mdi-file-link-outline',
    caption: 'Resolved',
    label: plugin.value?.resolved
  }
])

const router = useRouter()

async function remove() {
  await confirm('Are you sure to unload this plugin?')
  await client.plugin.unload(pluginId)
  router.replace(`${base}/plugin`)
}

async function load() {
  const result = await client.plugin.get(pluginId)
  if (!result) throw new Error('Plugin not found')
  plugin.value = result
}

load()
</script>
