<template>
  <q-list>
    <q-expansion-item
      v-for="[key, value] of Object.entries(props.params)"
      :key="key"
      icon="mdi-variable"
      :label="key"
      :caption="value.type ?? 'any'"
      header-class="text-mono"
    >
      <q-card>
        <q-card-section>
          <pre>{{ JSON.stringify(value, null, '  ') }}</pre>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script setup lang="ts">
const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>
}>()
</script>
