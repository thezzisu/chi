<template>
  <q-card-section>
    <div class="row justify-between items-center">
      <div>
        <div class="text-h6">Jobs</div>
      </div>
      <div>
        <q-btn
          padding="xs"
          flat
          icon="mdi-image-filter-center-focus"
          @click="tree?.scrollToRoot"
        />
      </div>
    </div>
  </q-card-section>
  <q-separator />
  <tree-view ref="tree" :node="root" :width="360" :gap="80">
    <template #default="{ node, value, toggle }">
      <div class="q-pa-sm">
        <q-card>
          <q-item manual-focus focused>
            <q-item-section avatar>
              <q-icon :name="icon(value)" :color="color(value)" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ value.serviceId }}/{{ value.actionId }}
              </q-item-label>
              <q-item-label caption class="text-mono">
                {{ value.id }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="q-gutter-xs">
                <q-btn
                  icon="mdi-dots-horizontal-circle-outline"
                  round
                  flat
                  dense
                  @click="emit('update:modelValue', value)"
                />
                <q-btn
                  v-if="node.children?.length"
                  icon="mdi-arrow-right"
                  round
                  flat
                  dense
                  @click="toggle"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </template>
  </tree-view>
</template>

<script setup lang="ts">
import { IJobInfo } from '@chijs/client'
import { createJobTree, icon, color } from 'src/shared/tasks'
import { computed, ref } from 'vue'
import TreeView from 'components/treeview/TreeView.vue'

const props = defineProps<{
  modelValue?: IJobInfo
  jobs: IJobInfo[]
}>()

const emit = defineEmits(['update:modelValue'])

const root = computed(() => createJobTree(props.jobs))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tree = ref<any>(null)
</script>

<style>
.c-jg-wrapper {
  overflow: scroll;
  max-height: 40vh;
}
</style>
