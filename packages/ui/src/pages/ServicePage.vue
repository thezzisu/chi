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
import { ref } from 'vue'
import { IServiceInfo } from '@chijs/client'
import { useRoute } from 'vue-router'
import { getClient } from 'src/shared/client'

const route = useRoute()
const serviceId = <string>route.params.serviceId
const client = getClient()
const service = ref<IServiceInfo>()

async function load() {
  service.value = await client.service.get(serviceId)
}

load()
</script>
