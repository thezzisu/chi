<template>
  <q-page padding class="row content-start">
    <div class="q-pa-sm col-12 col-lg-6">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div>
              <div class="text-h6">Action {{ action?.id }}</div>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <simple-list :items="list" />
        <q-separator />
        <description-view :desc="action?.meta.description" />
        <q-separator />
        <schema-viewer
          :schema="action?.params ?? { type: 'object' }"
          name="Parameters"
        />
        <q-separator />
        <schema-viewer
          :schema="action?.result ?? { type: 'void' }"
          name="Returns"
        />
      </q-card>
    </div>
    <div class="q-pa-sm col-12 col-lg-6">
      <action-run
        :plugin-id="pluginId"
        :action-id="actionId"
        :schema="action?.params ?? {}"
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from 'vue'
import type { IActionInfo } from '@chijs/app'
import { useRoute } from 'vue-router'
import { getClient } from 'src/shared/client'
import { baseKey } from 'src/shared/injections'
import ActionRun from 'components/ActionRun.vue'
import SchemaViewer from 'components/json/viewer/SchemaViewer.vue'
import DescriptionView from 'components/DescriptionView.vue'
import SimpleList, { ISimpleListItem } from 'components/SimpleList'

const base = inject(baseKey)
const route = useRoute()
const pluginId = <string>route.params.pluginId
const actionId = <string>route.params.actionId
const client = getClient()
const action = ref<IActionInfo>()
const list = computed<ISimpleListItem[]>(() => [
  { icon: 'mdi-identifier', caption: 'ID', label: action.value?.id },
  {
    icon: 'mdi-format-letter-case',
    caption: 'Name',
    label: action.value?.meta.name,
    hide: !action.value?.meta.name
  },
  {
    icon: 'mdi-cog',
    caption: 'Plugin',
    label: action.value?.pluginId,
    labelTo:
      `${base}/plugin/view/` + encodeURIComponent('' + action.value?.pluginId)
  }
])

async function load() {
  const result = await client.action.get(pluginId, actionId)
  if (!result) throw new Error('Action not found')
  action.value = result
}

load()
</script>
