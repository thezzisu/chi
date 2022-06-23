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
        <q-list>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-identifier" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>ID</q-item-label>
              <q-item-label>
                {{ action?.id }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="action?.meta.name">
            <q-item-section avatar>
              <q-icon name="mdi-format-letter-case" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Name</q-item-label>
              <q-item-label>
                {{ action?.meta.name }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-cog" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Plugin</q-item-label>
              <q-item-label>
                <router-link :to="urlPlugin">
                  {{ action?.pluginId }}
                </router-link>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
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
        :service-id="serviceId"
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

const base = inject(baseKey)
const route = useRoute()
const serviceId = <string>route.params.serviceId
const actionId = <string>route.params.actionId
const client = getClient()
const action = ref<IActionInfo>()

const urlPlugin = computed(
  () => `${base}/plugin/view/` + encodeURIComponent('' + action.value?.pluginId)
)

async function load() {
  const result = await client.action.get(serviceId, actionId)
  if (!result) throw new Error('Action not found')
  action.value = result
}

load()
</script>
