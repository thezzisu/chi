<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Create Service</div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="text-subtitle2">Params</div>
      <params-editor v-model="params" :schema="props.schema" />
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="text-subtitle2">Service Info</div>
      <q-input v-model="id" label="Service ID" />
      <q-input v-model="name" label="Service Name" />
      <q-input v-model="desc" label="Service Description" type="textarea" />
      <q-select
        v-model="restartPolicy"
        :options="restartOptions"
        label="Restart Policy"
      />
    </q-card-section>
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
</template>

<script lang="ts" setup>
import { inject, nextTick, ref, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ServiceRestartPolicy } from '@chijs/client'
import AsyncBtn from 'components/AsyncBtn.vue'
import ParamsEditor from 'components/ParamsEditor.vue'
import { baseKey } from 'src/shared/injections'
import { getClient } from 'src/shared/client'

const props = defineProps<{
  pluginId: string
  schema: unknown
}>()

const router = useRouter()
const client = getClient()
const base = inject(baseKey)

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
  await client.service.add({
    id: id.value,
    name: name.value,
    desc: desc.value,
    params: toRaw(params.value),
    restartPolicy: restartPolicy.value.value,
    pluginId: props.pluginId
  })
  nextTick(() => router.replace(`${base}/service/view/${id.value}`))
}
</script>
