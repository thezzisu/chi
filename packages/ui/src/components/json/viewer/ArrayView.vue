<template>
  <q-expansion-item :content-inset-level="0.2" default-opened>
    <template #header>
      <q-item-section>
        <q-item-label class="text-mono">{{ props.name }}</q-item-label>
        <q-item-label caption class="text-mono">
          <q-badge color="indigo">{{ props.schema.type }}</q-badge>
        </q-item-label>
      </q-item-section>
    </template>
    <schema-view :schema="items" name="items" />
  </q-expansion-item>
</template>

<script setup lang="ts">
import { JSONSchema7 } from 'json-schema'
import SchemaView from 'components/json/viewer/SchemaView.vue'
import { computed } from 'vue'

const props = defineProps<{
  name: string
  schema: JSONSchema7
}>()

const items = computed(() => props.schema.items as JSONSchema7)
</script>
