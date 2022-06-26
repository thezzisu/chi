<template>
  <q-page padding class="row content-start">
    <div v-if="env" class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="text-h6">Environment Settings</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-subtitle1">Environment Info</div>
          <div><b>ID</b>&#09;{{ env.id }}</div>
          <div><b>Type</b>&#09;{{ env.type }}</div>
        </q-card-section>
      </q-card>
    </div>
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="text-h6">Global Settings</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-subtitle1">ChiUI Info</div>
          <div><b>Version</b>&#09;{{ version }}</div>
          <div><b>Mode</b>&#09;{{ mode }}</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { getEnvironment } from 'src/shared'
import { useRoute } from 'vue-router'

const version = process.env.CHIUI_VERSION
const mode = process.env.MODE
const route = useRoute()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env: any =
  route.params.environmentId &&
  getEnvironment(<string>route.params.environmentId)
</script>
