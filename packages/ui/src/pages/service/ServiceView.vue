<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div>
              <div class="text-h6">Service Info</div>
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
              <async-btn
                :btn-props="{
                  padding: 'xs',
                  color: 'negative',
                  icon: 'mdi-delete',
                  outline: true
                }"
                :callback="remove"
                notify-success
              />
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
                {{ service?.id }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-power-plug" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Plugin</q-item-label>
              <q-item-label>
                <router-link :to="pluginUrl">
                  {{ service?.pluginId }}
                </router-link>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-power-plug" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Unit</q-item-label>
              <q-item-label>
                <router-link :to="pluginUrl">
                  {{ service?.unitId }}
                </router-link>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="service?.logPath">
            <q-item-section avatar>
              <q-icon name="mdi-text-box" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Log path</q-item-label>
              <q-item-label>{{ service.logPath }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="service?.rpcId">
            <q-item-section avatar>
              <q-icon name="mdi-cog" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Worker ID</q-item-label>
              <q-item-label>{{ service.rpcId }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator />
        <q-card-section>
          <div class="text-subtitle-1">Parameters</div>
          <pre>{{ JSON.stringify(service?.params, null, '  ') }}</pre>
        </q-card-section>
        <template v-if="service?.rpcId">
          <q-separator />
          <div class="text-subtitle-1 q-px-md q-pt-md q-pb-sm">
            Provided Functions
          </div>
          <q-list v-if="provides.length" dense class="q-pb-md">
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
          <div v-else class="column items-center q-pb-md">
            <q-icon name="mdi-function" size="xl" />
            <div class="text-caption">No provided functions</div>
          </div>
          <q-separator />
          <div class="text-subtitle-1 q-px-md q-pt-md q-pb-sm">
            Published Events
          </div>
          <q-list v-if="publishes.length" dense class="q-pb-md">
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
          <div v-else class="column items-center q-pb-md">
            <q-icon name="mdi-bullhorn-variant-outline" size="xl" />
            <div class="text-caption">No published events</div>
          </div>
        </template>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import type { IServiceInfo } from '@chijs/app'
import type { InternalDescriptor } from '@chijs/rpc'
import AsyncBtn from 'src/components/AsyncBtn.vue'
import ServiceStatus from 'src/components/ServiceStatus.vue'
import { baseKey, confirm, getClient } from 'src/shared'
import { computed, inject, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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
  if (service.value.rpcId) {
    const handle = client.endpoint.getHandle<InternalDescriptor>(
      service.value.rpcId
    )
    const info = await handle.call('#:info')
    provides.value = info.provides.filter((x) => !x.startsWith('#'))
    publishes.value = info.publishes.filter((x) => !x.startsWith('#'))
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

const router = useRouter()

async function remove() {
  await confirm('Are you sure you want to remove this service?')
  await client.service.remove(serviceId)
  router.replace(`${base}/service`)
}

async function load() {
  const info = await client.service.get(serviceId)
  if (!info) throw new Error('Service not found')
  update(info)
  sub = client.server.subscribe(
    '#server:service:update',
    (info) => update(info),
    serviceId
  )
}

load()
</script>
