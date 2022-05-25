<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="text-h6">Services ({{ services.length }})</div>
        </q-card-section>
        <q-separator />
        <q-card-section v-if="services.length" class="row">
          <div
            v-for="service of services"
            :key="service.id"
            class="q-pa-xs col-6 col-xl-1"
          >
            <q-card>
              <q-card-section>{{ service.id }}</q-card-section>
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label>{{ service.running }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-card-actions align="right">
                <q-btn
                  :to="`${base}/service/${encodeURIComponent(service.id)}`"
                  label="View"
                />
              </q-card-actions>
            </q-card>
          </div>
        </q-card-section>
        <q-card-section v-else class="column items-center">
          <div>
            <q-icon name="mdi-cog-off-outline" size="xl" color="primary" />
          </div>
          <div class="text-subtitle2">No services</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { baseKey, clientKey } from 'src/shared/injections'
import { inject, ref } from 'vue'
import { IServiceInfo } from '@chijs/client'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const client = inject(clientKey)!
const base = inject(baseKey)

const services = ref<IServiceInfo[]>([])

async function load() {
  services.value = await client.service.list()
}

load()
</script>
