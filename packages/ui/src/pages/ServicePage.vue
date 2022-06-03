<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div>
              <div class="text-h6">Service {{ service?.id }}</div>
              <q-chip
                text-color="white"
                :color="status[0]"
                :icon="status[1]"
                :label="status[2]"
                :clickable="false"
                square
              />
            </div>

            <div class="row q-gutter-sm">
              <async-btn
                :btn-props="{
                  padding: 'xs',
                  color: 'primary',
                  icon: 'mdi-play',
                  outline: true
                }"
                :callback="start"
                notify-success
              />
              <async-btn
                :btn-props="{
                  padding: 'xs',
                  color: 'primary',
                  icon: 'mdi-stop',
                  outline: true
                }"
                :callback="stop"
                notify-success
              />
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
              <q-item-label caption>Instantiated from</q-item-label>
              <q-item-label>{{ service?.plugin }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-text-box" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Log path</q-item-label>
              <q-item-label>{{ service?.logPath }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-cog" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Worker ID</q-item-label>
              <q-item-label>{{ service?.workerId }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator />
        <q-card-section>
          <div class="text-subtitle-1">Parameters</div>
          <pre>{{ JSON.stringify(service?.params, null, '  ') }}</pre>
        </q-card-section>
        <template v-if="service?.workerId">
          <q-separator />
          <q-card-section>
            <div class="text-subtitle-1">Provided Functions</div>
            <q-list v-if="provides.length" dense>
              <q-item v-for="(name, i) of provides" :key="i">
                <q-item-section avatar>
                  <q-icon name="mdi-function-variant" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    <code>{{ name }}</code>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="column items-center">
              <q-icon name="mdi-function" size="xl" />
              <div class="text-caption">No provided functions</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="text-subtitle-1">Published Events</div>
            <q-list v-if="publishes.length" dense>
              <q-item v-for="(name, i) of publishes" :key="i">
                <q-item-section avatar>
                  <q-icon name="mdi-bullhorn-variant" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    <code>{{ name }}</code>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="column items-center">
              <q-icon name="mdi-bullhorn-variant-outline" size="xl" />
              <div class="text-caption">No published events</div>
            </div>
          </q-card-section>
        </template>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import {
  InternalDescriptor,
  IServiceInfo,
  RPC,
  ServiceState
} from '@chijs/client'
import { useRoute } from 'vue-router'
import { getClient } from 'src/shared/client'
import AsyncBtn from 'src/components/AsyncBtn.vue'

const route = useRoute()
const serviceId = <string>route.params.serviceId
const client = getClient()
const service = ref<IServiceInfo>()
const provides = ref<string[]>([])
const publishes = ref<string[]>([])
const status = computed(() => {
  if (service.value) {
    if (service.value.state === ServiceState.RUNNING) {
      return ['positive', 'mdi-play', 'Running']
    } else {
      return ['dark', 'mdi-stop', 'Stopped']
    }
  } else {
    return [undefined, 'mdi-timer-sand-empty', 'Loading']
  }
})

async function load() {
  service.value = await client.service.get(serviceId)
  if (service.value.workerId) {
    const handle = client.endpoint.getHandle<InternalDescriptor>(
      RPC.worker(service.value.workerId)
    )
    const info = await handle.call('$:info')
    provides.value = info.provides.filter((x) => !x.startsWith('$'))
    publishes.value = info.publishes.filter((x) => !x.startsWith('$'))
  }
}

async function start() {
  await client.service.start(serviceId)
  await load()
}

async function stop() {
  await client.service.stop(serviceId)
  await load()
}

load()
</script>
