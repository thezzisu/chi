<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
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
              <q-icon name="mdi-power-plug" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Service</q-item-label>
              <q-item-label>
                <router-link :to="`${base}/service/${action?.serviceId}`">
                  {{ action?.serviceId }}
                </router-link>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { inject, ref } from 'vue'
import { IActionInfoWithService } from '@chijs/client'
import { useRoute } from 'vue-router'
import { getClient } from 'src/shared/client'
import { baseKey } from 'src/shared/injections'

const base = inject(baseKey)
const route = useRoute()
const serviceId = <string>route.params.serviceId
const actionId = <string>route.params.actionId
const client = getClient()
const action = ref<IActionInfoWithService>()

async function load() {
  action.value = await client.action.get(serviceId, actionId)
}

load()
</script>
