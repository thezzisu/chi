<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="text-h6">Add Service</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-select
            v-model="selected"
            filled
            label="Select a plugin"
            :options="options"
            option-label="id"
            :loading="pluginsLoading"
            @filter="(pluginFilter as never)"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
      </q-card>
    </div>
    <div v-if="selected" class="q-pa-sm col-12">
      <service-create :plugin-id="selected.id" :schema="selected.params" />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { IPluginInfo } from '@chijs/client'
import { getClient } from 'src/shared/client'
import ServiceCreate from 'components/ServiceCreate.vue'

const route = useRoute()
const pluginId = route.query.pluginId

const client = getClient()

const options = ref<IPluginInfo[]>()
const selected = ref<IPluginInfo | null>(null)
const pluginsLoading = ref(false)

async function loadPlugins() {
  if (pluginsLoading.value) return
  pluginsLoading.value = true
  try {
    options.value = await client.plugin.list()
    const target = options.value.find((plugin) => plugin.id === pluginId)
    if (target) selected.value = target
  } catch (e) {
    //
  }
  pluginsLoading.value = false
}

loadPlugins()

async function pluginFilter(val: string, update: () => void) {
  if (options.value) return update()
  await loadPlugins()
  update()
}
</script>
