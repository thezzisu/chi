<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div class="text-h6">Actions ({{ actions.length }})</div>
          </div>
        </q-card-section>
        <q-list separator bordered>
          <q-item
            v-for="(action, i) of actions"
            :key="i"
            :to="
              `${base}/action/view` +
              `/${encodeURIComponent(action.serviceId)}` +
              `/${encodeURIComponent(action.id)}`
            "
          >
            <q-item-section>
              <q-item-label>
                {{ action.serviceId }} / {{ action.id }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-item v-if="!actions.length" class="column items-center">
          <div>
            <q-icon name="mdi-cog-off-outline" size="xl" color="primary" />
          </div>
          <div class="text-subtitle2">No actions</div>
        </q-item>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { baseKey } from 'src/shared/injections'
import { inject, ref } from 'vue'
import { IActionInfoWithService } from '@chijs/client'
import { getClient } from 'src/shared/client'

const client = getClient()
const base = inject(baseKey)

const actions = ref<IActionInfoWithService[]>([])

async function load() {
  actions.value = await client.action.list()
}

load()
</script>
