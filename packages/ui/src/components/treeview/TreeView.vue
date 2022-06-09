<template>
  <div class="c-tv-wrapper">
    <tree-node v-bind="props" ref="node">
      <template #default="scoped">
        <slot v-bind="scoped"></slot>
      </template>
    </tree-node>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TreeNode from 'components/treeview/TreeNode.vue'
import type { Node } from 'src/shared/treeview'

const props = withDefaults(
  defineProps<{
    width?: number
    gap?: number
    node: Node
  }>(),
  { width: 300, gap: 100 }
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const node = ref<any>(null)

function scrollToRoot() {
  node.value?.root?.scrollIntoView(false, {
    block: 'center',
    behavior: 'smooth'
  })
}

defineExpose({ scrollToRoot })
</script>

<style>
.c-tv-wrapper {
  overflow: scroll;
  height: 280px;
  resize: vertical;
}
</style>
