<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div>
              <div class="text-h6">Service {{ service?.id }}</div>
              <service-status :state="service?.state" />
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
              <q-item-label>
                <router-link :to="pluginUrl">
                  {{ service?.pluginId }}
                </router-link>
              </q-item-label>
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
import { computed, inject, onBeforeUnmount, ref } from 'vue'
import { InternalDescriptor, IServiceInfo, RPC } from '@chijs/client'
import { useRoute } from 'vue-router'
import { getClient } from 'src/shared/client'
import AsyncBtn from 'src/components/AsyncBtn.vue'
import ServiceStatus from 'src/components/ServiceStatus.vue'
import { baseKey } from 'src/shared/injections'

const base = inject(baseKey)
const route = useRoute()
const serviceId = <string>route.params.serviceId
const client = getClient()
const service = ref<IServiceInfo>()
const provides = ref<string[]>([])
const publishes = ref<string[]>([])

const pluginUrl = computed(
  () =>
    `${base}/plugin/view/` + encodeURIComponent('' + service.value?.pluginId)
)

async function update(info: IServiceInfo) {
  service.value = info
  if (service.value.workerId) {
    const handle = client.endpoint.getHandle<InternalDescriptor>(
      RPC.worker(service.value.workerId)
    )
    const info = await handle.call('$:info')
    provides.value = info.provides.filter((x) => !x.startsWith('$'))
    publishes.value = info.publishes.filter((x) => !x.startsWith('$'))
  }
}

let sub: Promise<string> | null = null

async function unsub() {
  if (sub) {
    sub.then((id) => client.server.unsubscribe(id))
    sub = null
  }
}

onBeforeUnmount(() => {
  unsub()
})

async function start() {
  await client.service.start(serviceId)
}

async function stop() {
  await client.service.stop(serviceId)
}

async function load() {
  update(await client.service.get(serviceId))
  sub = client.server.subscribe(
    '$s:service:update',
    (info) => update(info),
    serviceId
  )
}

load()
</script>
