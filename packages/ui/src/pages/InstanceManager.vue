<template>
  <q-page padding class="column justify-center items-center">
    <q-card style="max-width: 640px; min-width: 320px">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-h6">Instances</div>
          <div>
            <q-btn padding="xs" color="primary" icon="mdi-plus" to="/edit" />
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <q-list v-if="instances.length">
        <q-item v-for="instance of instances" :key="instance.id">
          <q-item-section avatar>
            <q-icon name="mdi-web" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ instance.name }}</q-item-label>
            <q-item-label overline>{{ instance.type }}</q-item-label>
            <q-item-label caption>{{ instance.url }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="text-grey-8 q-gutter-xs">
              <q-btn
                flat
                dense
                round
                icon="mdi-open-in-new"
                :to="`/instance/${instance.id}/`"
                target="_blank"
              />
              <q-btn
                flat
                dense
                round
                icon="mdi-pencil-box-outline"
                :to="`/edit/${instance.id}`"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <q-card-section v-else class="column items-center">
        <div>
          <q-icon name="mdi-flask-empty-outline" size="xl" color="primary" />
        </div>
        <div class="text-subtitle2">No instances</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { instances } from 'src/shared/instance'
</script>
