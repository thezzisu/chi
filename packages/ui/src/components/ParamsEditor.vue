<template>
  <json-editor
    :model-value="props.modelValue"
    label="Params"
    :schema="props.schema"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import JsonEditor from 'components/JsonEditor.vue'

const props = defineProps<{
  modelValue: unknown
  schema?: unknown
}>()

const emit = defineEmits(['update:modelValue'])
</script>
