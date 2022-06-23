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
        <schema-viewer
          :schema="plugin?.params ?? { type: 'object' }"
          name="Parameters"
        />
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
import { computed, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SchemaViewer from 'components/json/viewer/SchemaViewer.vue'
import DescriptionView from 'components/DescriptionView.vue'
import AsyncBtn from 'components/AsyncBtn.vue'
import { getClient, baseKey, confirm } from 'src/shared'
import type { IPluginInfo } from '@chijs/app'
import SimpleList, { ISimpleListItem } from 'components/SimpleList'

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
