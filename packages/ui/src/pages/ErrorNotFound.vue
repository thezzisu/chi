<template>
  <q-page class="row items-stretch">
    <div class="col-grow text-center q-pa-md flex flex-center">
      <div>
        <div style="font-size: 30vh">404</div>

        <div class="text-h2" style="opacity: 0.4">Oops. Nothing here...</div>

        <q-btn
          class="q-mt-xl"
          color="primary"
          unelevated
          :to="base"
          label="Go Home"
          no-caps
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const base = route.params.instanceId
  ? `/instance/${route.params.instanceId}`
  : '/'
</script>
