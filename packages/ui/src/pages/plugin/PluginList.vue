<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div class="text-h6">Plugins ({{ plugins.length }})</div>
            <div>
              <q-btn
                padding="xs"
                color="primary"
                icon="mdi-plus"
                :to="`${base}/plugin/load`"
              />
            </div>
          </div>
        </q-card-section>
        <q-list class="list bg-white" separator bordered>
          <q-item
            v-for="plugin of plugins"
            :key="plugin.id"
            :to="`${base}/plugin/view/${encodeURIComponent(plugin.id)}`"
          >
            <q-item-section>
              <q-item-label>{{ plugin.id }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-item v-if="!plugins.length" class="column items-center">
          <div>
            <q-icon
              name="mdi-power-plug-off-outline"
              size="xl"
              color="primary"
            />
          </div>
          <div class="text-subtitle2">No plugins</div>
        </q-item>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { baseKey } from 'src/shared/injections'
import { inject, ref } from 'vue'
import { IPluginInfo } from '@chijs/client'
import { getClient } from 'src/shared/client'

const client = getClient()
const base = inject(baseKey)

const plugins = ref<IPluginInfo[]>([])

async function load() {
  plugins.value = await client.plugin.list()
}

load()
</script>
