<template>
  <q-list>
    <q-expansion-item icon="mdi-text" label="Description" default-opened>
      <q-card>
        <q-card-section v-if="props.desc">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <article class="markdown-body" v-html="html" />
        </q-card-section>
        <q-card-section v-else class="column items-center">
          <q-icon name="mdi-head-lightbulb-outline" size="xl" />
          <div class="text-caption">No description</div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script setup lang="ts">
import markdown from 'markdown-it'
import { computed } from 'vue'

const md = markdown()

const props = defineProps<{
  desc?: string
}>()

const html = computed(() => (props.desc ? md.render(props.desc) : ''))
</script>
