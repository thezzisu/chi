<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div class="text-h6">Services ({{ services.length }})</div>
            <div>
              <q-btn
                padding="xs"
                color="primary"
                icon="mdi-plus"
                :to="`${base}/service/add`"
              />
            </div>
          </div>
        </q-card-section>
        <q-list class="list bg-white" separator bordered dense>
          <q-item v-for="service of services" :key="service.id">
            <q-item-section>
              <q-item-section>{{ service.id }}</q-item-section>
            </q-item-section>
            <q-item>
              <service-status :state="service.state" />
            </q-item>
            <q-item-section side>
              <q-btn
                :to="`${base}/service/view/${encodeURIComponent(service.id)}`"
                icon="mdi-eye"
                round
                flat
                dense
              />
            </q-item-section>
          </q-item>
        </q-list>
        <q-item-section v-if="!services.length" class="column items-center">
          <div>
            <q-icon name="mdi-cog-off-outline" size="xl" color="primary" />
          </div>
          <div class="text-subtitle2">No services</div>
        </q-item-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { baseKey } from 'src/shared/injections'
import { inject, ref } from 'vue'
import { IServiceInfo } from '@chijs/client'
import { getClient } from 'src/shared/client'
import ServiceStatus from 'src/components/ServiceStatus.vue'

const client = getClient()
const base = inject(baseKey)

const services = ref<IServiceInfo[]>([])

async function load() {
  services.value = await client.service.list()
}

load()
</script>
