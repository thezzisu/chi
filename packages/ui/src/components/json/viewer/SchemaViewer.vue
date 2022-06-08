<template>
  <q-list>
    <schema-view :schema="props.schema" :name="name" />
  </q-list>
</template>

<script setup lang="ts">
import SchemaView from 'components/json/viewer/SchemaView.vue'

const props = defineProps<{
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any
}>()
</script>
