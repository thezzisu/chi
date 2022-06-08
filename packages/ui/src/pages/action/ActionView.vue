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
          <q-item v-if="action?.name">
            <q-item-section avatar>
              <q-icon name="mdi-format-letter-case" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Name</q-item-label>
              <q-item-label>
                {{ action?.name }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-cog" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Service</q-item-label>
              <q-item-label>
                <router-link :to="serviceUrl">
                  {{ action?.serviceId }}
                </router-link>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator />
        <description-view :desc="action?.desc" />
        <q-separator />
        <schema-viewer
          :schema="action?.params ?? { type: 'object' }"
          name="Parameters"
        />
        <q-separator />
        <schema-viewer
          :schema="action?.return ?? { type: 'void' }"
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
import { IActionInfoWithService } from '@chijs/client'
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
const action = ref<IActionInfoWithService>()

const serviceUrl = computed(
  () =>
    `${base}/service/view/` + encodeURIComponent('' + action.value?.serviceId)
)

async function load() {
  action.value = await client.action.get(serviceId, actionId)
}

load()
</script>
