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
              <q-icon name="mdi-identifier" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>ID</q-item-label>
              <q-item-label>
                {{ plugin?.id }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="plugin?.name">
            <q-item-section avatar>
              <q-icon name="mdi-format-letter-case" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Name</q-item-label>
              <q-item-label>
                {{ plugin?.name }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-file-link-outline" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Resolved</q-item-label>
              <q-item-label>
                <code>{{ plugin?.resolved }}</code>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator />
        <description-view :desc="plugin?.desc" />
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
    <div class="q-pa-sm col-12 col-lg-6">
      <service-create :plugin-id="pluginId" :schema="plugin?.params" />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { inject, ref } from 'vue'
import { IPluginInfo } from '@chijs/client'
import { useRoute, useRouter } from 'vue-router'
import SchemaViewer from 'components/json/viewer/SchemaViewer.vue'
import ServiceCreate from 'components/ServiceCreate.vue'
import DescriptionView from 'components/DescriptionView.vue'
import AsyncBtn from 'components/AsyncBtn.vue'
import { getClient, baseKey, confirm } from 'src/shared'

const route = useRoute()
const pluginId = <string>route.params.pluginId
const client = getClient()
const plugin = ref<IPluginInfo>()
const base = inject(baseKey)

const router = useRouter()

async function remove() {
  await confirm('Are you sure to unload this plugin?')
  await client.plugin.unload(pluginId)
  router.replace(`${base}/plugin`)
}

async function load() {
  plugin.value = await client.plugin.get(pluginId)
}

load()
</script>
