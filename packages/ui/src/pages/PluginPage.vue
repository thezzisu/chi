<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="text-h6">Plugins ({{ plugins.length }})</div>
        </q-card-section>
        <q-separator />
        <q-card-section v-if="plugins.length" class="row">
          <div
            v-for="plugin of plugins"
            :key="plugin.name"
            class="q-pa-xs col-6 col-xl-1"
          >
            <q-card>
              <q-card-section>{{ plugin.name }}</q-card-section>
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label>{{ plugin.resolved }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </q-card-section>
        <q-card-section v-else class="column items-center">
          <div>
            <q-icon
              name="mdi-power-plug-off-outline"
              size="xl"
              color="primary"
            />
          </div>
          <div class="text-subtitle2">No plugins</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { clientKey } from 'src/shared/injections'
import { inject, ref } from 'vue'
import { IPluginInfo } from '@chijs/client'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const client = inject(clientKey)!

const plugins = ref<IPluginInfo[]>([])

async function load() {
  plugins.value = await client.plugin.list()
}

load()
</script>
