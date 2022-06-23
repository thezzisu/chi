<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="text-h6">Load plugin</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-input v-model="id" label="Plugin ID" />
          <params-editor v-model="params" />
        </q-card-section>
        <q-card-actions align="right">
          <async-btn
            :callback="load"
            :btn-props="{
              icon: 'mdi-plus',
              color: 'primary',
              label: 'Load'
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
import { useRouter } from 'vue-router'
import ParamsEditor from 'src/components/ParamsEditor.vue'

const router = useRouter()
const client = getClient()
const base = inject(baseKey)
const id = ref<string>('')
const params = ref({})

async function load() {
  const [ok, reason] = await client.plugin.load(id.value, toRaw(params.value))
  if (!ok) throw new Error(reason)
  nextTick(() => router.push(`${base}/plugin`))
}
</script>
