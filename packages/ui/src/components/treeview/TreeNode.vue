<template>
  <div ref="el">
    <div class="c-tn-wrapper row no-wrap items-center">
      <svg ref="svg" class="c-tn-svg">
        <line
          v-for="(line, i) of lines"
          :key="i"
          :x1="line[0]"
          :y1="line[1]"
          :x2="line[2]"
          :y2="line[3]"
          style="stroke: #cecece; stroke-width: 2"
        />
      </svg>
      <div ref="root" class="c-tn-root">
        <slot
          :node="props.node"
          :value="props.node.value"
          :toggle="toggle"
        ></slot>
      </div>
      <template v-if="expand">
        <div ref="sep" class="c-tn-gap"></div>
        <div class="column">
          <tree-node
            v-for="(elem, i) of elems"
            v-bind="elem"
            :key="i"
            ref="children"
          >
            <template #default="scoped">
              <slot :name="'default'" v-bind="scoped"></slot>
            </template>
          </tree-node>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTreeViewLines } from 'src/shared/treeview'
import type { Node } from 'src/shared/treeview'

const props = defineProps<{
  width: number
  gap: number
  node: Node
}>()
const width = computed(() => props.width + 'px')
const gap = computed(() => props.gap + 'px')
const expand = ref(true)
const elems = computed(() =>
  (props.node.children ?? []).map((node) => Object.assign({}, props, { node }))
)
const { el, svg, root, sep, children, lines } = useTreeViewLines()

function toggle() {
  expand.value = !expand.value
}

defineExpose({ root, toggle })
</script>

<style>
.c-tn-wrapper {
  position: relative;
  width: fit-content;
}

.c-tn-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.c-tn-root {
  width: v-bind(width);
}

.c-tn-gap {
  width: v-bind(gap);
}
</style>
