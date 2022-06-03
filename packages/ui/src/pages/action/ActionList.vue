<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div class="text-h6">Actions ({{ actions.length }})</div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section v-if="actions.length" class="row">
          <div
            v-for="(action, i) of actions"
            :key="i"
            class="q-pa-xs col-6 col-xl-1"
          >
            <q-card>
              <q-card-section>{{ action.id }}</q-card-section>
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label>{{ action.serviceId }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-card-actions align="right">
                <q-btn
                  :to="
                    `${base}/action/view` +
                    `/${encodeURIComponent(action.serviceId)}` +
                    `/${encodeURIComponent(action.id)}`
                  "
                  label="View"
                />
              </q-card-actions>
            </q-card>
          </div>
        </q-card-section>
        <q-card-section v-else class="column items-center">
          <div>
            <q-icon name="mdi-cog-off-outline" size="xl" color="primary" />
          </div>
          <div class="text-subtitle2">No actions</div>
        </q-card-section>
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
