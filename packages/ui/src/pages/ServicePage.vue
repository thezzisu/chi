<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          {{ service }}
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { clientKey } from 'src/shared/injections'
import { inject, ref } from 'vue'
import { IServiceInfo } from '@chijs/client'
import { useRoute } from 'vue-router'

const route = useRoute()
const serviceId = <string>route.params.serviceId
const client = inject(clientKey)!
const service = ref<IServiceInfo>()

async function load() {
  service.value = await client.service.get(serviceId)
}

load()
</script>
