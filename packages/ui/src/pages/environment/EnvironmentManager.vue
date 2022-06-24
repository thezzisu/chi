<template>
  <q-page padding class="column justify-center items-center">
    <q-card style="max-width: 640px; min-width: 320px">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-h6">Environments</div>
          <div>
            <q-btn padding="xs" color="primary" icon="mdi-plus" to="/edit" />
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <q-list v-if="environments.length">
        <q-item v-for="env of environments" :key="env.id">
          <q-item-section avatar>
            <q-icon name="mdi-web" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ env.name }}</q-item-label>
            <q-item-label overline>{{ env.type }}</q-item-label>
            <q-item-label caption class="text-mono" lines="1">
              {{ env.type === 'local' ? env.config : env.url }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="text-grey-8 q-gutter-xs">
              <q-btn
                flat
                dense
                round
                icon="mdi-open-in-new"
                @click="open(`/environment/${env.id}/`)"
              />
              <q-btn
                flat
                dense
                round
                icon="mdi-pencil-box-outline"
                :to="`/edit/${env.id}`"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <q-card-section v-else class="column items-center">
        <div>
          <q-icon name="mdi-flask-empty-outline" size="xl" color="primary" />
        </div>
        <div class="text-subtitle2">No Environments</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { environments } from 'src/shared/environment'
import { useRouter } from 'vue-router'
const router = useRouter()

function open(path: string) {
  if (window.bridge?.open) {
    window.bridge.open(path)
  } else {
    window.open(router.resolve(path).href, '_blank')
  }
}
</script>
