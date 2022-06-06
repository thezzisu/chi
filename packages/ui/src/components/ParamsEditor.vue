<template>
  <div v-for="key of Object.keys(props.schema)" :key="key">
    <json-editor
      :model-value="props.modelValue[key]"
      :label="key"
      :schema="props.schema[key]"
      @update:model-value="update(key, $event)"
    />
  </div>
</template>

<script setup lang="ts">
import JsonEditor from 'components/JsonEditor.vue'

const props = defineProps<{
  modelValue: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Record<string, any>
}>()

const emit = defineEmits(['update:modelValue'])

function update(key: string, value: unknown) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>
