<template>
  <q-page padding class="row">
    <div class="q-pa-sm col-12">
      <q-card>
        <q-card-section>
          <div class="row justify-between items-center">
            <div class="text-h6">Units ({{ units.length }})</div>
          </div>
        </q-card-section>
        <q-list separator bordered>
          <q-item
            v-for="(unit, i) of units"
            :key="i"
            :to="
              `${base}/unit/view` +
              `/${encodeURIComponent(unit.pluginId)}` +
              `/${encodeURIComponent(unit.id)}`
            "
          >
            <q-item-section>
              <q-item-label>
                <q-breadcrumbs>
                  <template #separator>
                    <q-icon
                      size="1.5em"
                      name="mdi-chevron-right"
                      color="primary"
                    />
                  </template>
                  <q-breadcrumbs-el :label="unit.pluginId" />
                  <q-breadcrumbs-el :label="unit.id" />
                </q-breadcrumbs>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-item v-if="!units.length" class="column items-center">
          <div>
            <q-icon name="mdi-cog-off-outline" size="xl" color="primary" />
          </div>
          <div class="text-subtitle2">No units</div>
        </q-item>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { baseKey } from 'src/shared/injections'
import { inject, ref } from 'vue'
import type { IUnitInfo } from '@chijs/app'
import { getClient } from 'src/shared/client'

const client = getClient()
const base = inject(baseKey)

const units = ref<IUnitInfo[]>([])

async function load() {
  units.value = await client.unit.list()
}

load()
</script>
