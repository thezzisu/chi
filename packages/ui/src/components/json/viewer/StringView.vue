<template>
  <q-expansion-item>
    <template #header>
      <q-item-section>
        <q-item-label class="text-mono">{{ props.name }}</q-item-label>
        <q-item-label caption class="text-mono">
          <q-badge color="yellow-9">{{ props.schema.type }}</q-badge>
        </q-item-label>
      </q-item-section>
    </template>
    <q-card>
      <q-card-section class="q-py-none">
        <pre class="q-my-none">{{
          JSON.stringify(props.schema, null, '  ')
        }}</pre>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { JSONSchema7 } from 'json-schema'

const props = defineProps<{
  name: string
  schema: JSONSchema7
}>()
</script>
