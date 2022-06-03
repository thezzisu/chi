<template>
  <div class="q-py-sm">
    <div v-if="props.label" class="text-caption text-grey-7">
      {{ props.label }}
    </div>
    <q-banner v-if="error" inline-actions class="text-white bg-red">
      <template #avatar>
        <q-icon name="mdi-alert-circle-outline" />
      </template>
      {{ error }}
    </q-banner>
    <q-input v-model.trim="json" type="textarea" class="editor" />
  </div>
</template>

<script setup lang="ts">
import { validateJsonSchema } from '@chijs/client'
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: unknown
  label?: string
  schema?: unknown
}>()
const emit = defineEmits(['update:modelValue'])

const json = ref('')
const error = ref('')

watch(
  () => props.modelValue,
  (cur) => {
    json.value = JSON.stringify(cur, null, '  ')
  },
  { immediate: true, deep: true }
)

watch(json, (cur) => {
  try {
    const parsed = JSON.parse(cur)
    if (props.schema) {
      const errors = validateJsonSchema(parsed, <never>props.schema)
      if (errors.length) {
        throw new Error(errors.map((e) => e.message).join('\n'))
      }
    }
    emit('update:modelValue', parsed)
    error.value = ''
  } catch (e) {
    error.value = '' + e
  }
})
</script>

<style>
.editor {
  font-family: 'Courier New', Courier, monospace;
}
</style>
