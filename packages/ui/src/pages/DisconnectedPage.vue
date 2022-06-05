<template>
  <q-page class="row items-stretch">
    <div class="col-grow text-center q-pa-md flex flex-center">
      <div>
        <div>
          <q-icon name="mdi-web-off" size="8rem" color="grey-8" />
        </div>
        <div class="text-h2 text-grey-6">Disconnected</div>
        <div class="text-h5 text-mono q-pt-sm">{{ props.message }}</div>
        <div class="q-pt-md">
          <q-btn
            label="Reload"
            icon="mdi-reload"
            unelevated
            color="primary"
            @click="reload"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
const props = defineProps<{ message: string }>()

function reload() {
  window.location.reload()
}
</script>
