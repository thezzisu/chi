<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Run this action</div>
    </q-card-section>
    <q-card-section>
      <div class="text-h6">Params</div>
      <params-editor v-model="params" :schema="props.schema" />
    </q-card-section>
    <q-card-actions align="right">
      <async-btn
        :btn-props="{
          color: 'primary',
          label: 'Run',
          icon: 'mdi-play'
        }"
        :callback="dispatch"
        notify-success
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { inject, ref, toRaw } from 'vue'
import { getClient } from 'src/shared/client'
import AsyncBtn from 'components/AsyncBtn.vue'
import ParamsEditor from 'components/ParamsEditor.vue'
import { baseKey } from 'src/shared/injections'
import { useRouter } from 'vue-router'

const props = defineProps<{
  pluginId: string
  actionId: string
  schema: unknown
}>()

const params = ref<Record<string, unknown>>({})
const base = inject(baseKey)
const router = useRouter()
const client = getClient()

async function dispatch() {
  const taskId = await client.action.dispatch(
    client.endpoint.localId,
    props.pluginId,
    props.actionId,
    toRaw(params.value)
  )
  router.push(`${base}/task/view/${taskId}`)
}
</script>
