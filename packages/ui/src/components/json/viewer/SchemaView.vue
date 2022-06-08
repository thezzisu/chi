<template>
  <component :is="target" v-bind="props" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { JSONSchema7 } from 'json-schema'
import ObjectView from 'components/json/viewer/ObjectView.vue'
import UnknownView from 'components/json/viewer/UnknownView.vue'
import StringView from 'components/json/viewer/StringView.vue'
import NumberView from 'components/json/viewer/NumberView.vue'
import ArrayView from 'components/json/viewer/ArrayView.vue'
import BooleanView from 'components/json/viewer/BooleanView.vue'

const props = defineProps<{
  name: string
  schema: JSONSchema7
}>()

const target = computed(() => {
  switch (props.schema.type) {
    case 'object':
      return ObjectView
    case 'string':
      return StringView
    case 'integer':
    case 'number':
      return NumberView
    case 'array':
      return ArrayView
    case 'boolean':
      return BooleanView
    default:
      return UnknownView
  }
})
</script>
