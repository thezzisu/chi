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
        <template v-if="selected">
          <q-separator />
          <q-card-section>
            <div class="text-subtitle2">Plugin Params</div>
            <pre>{{ JSON.stringify(selected.params, null, '  ') }}</pre>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="text-subtitle2">Params</div>
            <div v-for="key of Object.keys(selected.params)" :key="key">
              <json-editor
                v-model="params[key]"
                :label="key"
                :schema="selected.params[key]"
              />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="text-subtitle2">Service Info</div>
            <q-input v-model="id" label="Service ID" />
            <q-input v-model="name" label="Service Name" />
            <q-input
              v-model="desc"
              label="Service Description"
              type="textarea"
            />
            <q-select
              v-model="restartPolicy"
              :options="restartOptions"
              label="Restart Policy"
            />
          </q-card-section>
        </template>
        <q-card-actions align="right">
          <async-btn
            :callback="add"
            :btn-props="{
              icon: 'mdi-plus',
              color: 'primary',
              label: 'Add'
            }"
            notify-success
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { baseKey } from 'src/shared/injections'
import { inject, nextTick, ref, toRaw } from 'vue'
import { getClient } from 'src/shared/client'
import AsyncBtn from 'src/components/AsyncBtn.vue'
import { useRoute, useRouter } from 'vue-router'
import { IPluginInfo, ServiceRestartPolicy } from '@chijs/client'
import JsonEditor from 'src/components/JsonEditor.vue'

const route = useRoute()
const pluginId = route.query.pluginId

const router = useRouter()
const client = getClient()
const base = inject(baseKey)

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

const id = ref('')
const name = ref('')
const desc = ref('')
const params = ref<Record<string, unknown>>({})
const restartOptions = [
  { label: 'Never', value: ServiceRestartPolicy.NEVER },
  { label: 'On Failure', value: ServiceRestartPolicy.ON_FAILURE },
  { label: 'Always', value: ServiceRestartPolicy.ALWAYS }
]
const restartPolicy = ref(restartOptions[0])

async function add() {
  if (!selected.value) throw new Error('No plugin selected')
  await client.service.add({
    id: id.value,
    name: name.value,
    desc: desc.value,
    params: toRaw(params.value),
    restartPolicy: restartPolicy.value.value,
    pluginId: selected.value.id
  })
  nextTick(() => router.replace(`${base}/service/view/${id.value}`))
}
</script>
