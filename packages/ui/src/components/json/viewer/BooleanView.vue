<template>
  <q-expansion-item :content-inset-level="0.2">
    <template #header>
      <q-item-section>
        <q-item-label class="text-mono">{{ props.name }}</q-item-label>
        <q-item-label caption class="text-mono">
          <q-badge color="purple">{{ props.schema.type }}</q-badge>
        </q-item-label>
      </q-item-section>
    </template>
    <schema-view
      v-for="[key, value] of properties"
      :key="key"
      :schema="value"
      :name="key"
    />
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

const properties = computed(
  () => Object.entries(props.schema.properties ?? {}) as [string, JSONSchema7][]
)
</script>
