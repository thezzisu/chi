<template>
  <q-page padding class="row content-start">
    <div class="q-pa-sm col-12 col-lg-6">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div>
              <div class="text-h6">Unit Details</div>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <simple-list :items="list" />
        <q-separator />
        <description-view :desc="unit?.meta.description" />
        <q-separator />
        <schema-viewer
          :schema="unit?.params ?? { type: 'object' }"
          name="Parameters"
        />
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from 'vue'
import type { IUnitInfo } from '@chijs/app'
import { useRoute } from 'vue-router'
import { getClient } from 'src/shared/client'
import { baseKey } from 'src/shared/injections'
import SchemaViewer from 'components/json/viewer/SchemaViewer.vue'
import DescriptionView from 'components/DescriptionView.vue'
import SimpleList, { ISimpleListItem } from 'components/SimpleList'

const base = inject(baseKey)
const route = useRoute()
const pluginId = <string>route.params.pluginId
const unitId = <string>route.params.unitId
const client = getClient()
const unit = ref<IUnitInfo>()
const list = computed<ISimpleListItem[]>(() => [
  { icon: 'mdi-identifier', caption: 'ID', label: unit.value?.id },
  {
    icon: 'mdi-format-letter-case',
    caption: 'Name',
    label: unit.value?.meta.name,
    hide: !unit.value?.meta.name
  },
  {
    icon: 'mdi-cog',
    caption: 'Plugin',
    label: unit.value?.pluginId,
    labelTo:
      `${base}/plugin/view/` + encodeURIComponent('' + unit.value?.pluginId)
  }
])

async function load() {
  const result = await client.unit.get(pluginId, unitId)
  if (!result) throw new Error('Unit not found')
  unit.value = result
}

load()
</script>
