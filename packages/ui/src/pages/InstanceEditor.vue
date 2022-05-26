<template>
  <q-page padding class="column justify-center items-center">
    <q-card style="max-width: 640px; min-width: 320px">
      <q-card-section>
        <div class="row items-center">
          <div class="q-pr-sm">
            <q-btn flat padding="xs" icon="mdi-arrow-left" to="/" />
          </div>
          <div v-if="isNew" class="text-h6 col-grow">New Instance</div>
          <div v-else class="text-h6 col-grow">Edit Instance</div>
          <div>
            <q-btn
              v-if="!isNew"
              padding="xs"
              color="negative"
              icon="mdi-delete"
              @click="remove"
            />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-input v-model="current.name" label="Name" />
        <div class="q-pt-sm">
          <div class="text-grey-7 text-caption">Type</div>
          <q-option-group
            v-model="current.type"
            name="preferred_genre"
            :options="instanceTypes"
            color="primary"
            inline
          />
        </div>
        <q-input v-model="current.url" label="URL" />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn color="negative" outline label="Reset" @click="reset" />
        <q-btn
          color="primary"
          :label="isNew ? `Create` : `Save`"
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { nanoid } from 'nanoid'
import { getInstance, instanceMap, Instance } from 'src/shared/instance'
import { easyDeepClone } from 'src/shared/misc'
import { useQuasar } from 'quasar'

const route = useRoute()
const id = <string>route.params.id
const isNew = !id

const instanceTypes = [{ label: 'Remote', value: 'remote' }]

const newInstance: Instance = {
  id: nanoid(),
  name: 'New Instance',
  type: 'remote',
  url: 'ws://localhost:3000'
}

const current = ref(easyDeepClone(isNew ? newInstance : getInstance(id).value))

function reset() {
  current.value = easyDeepClone(isNew ? newInstance : getInstance(id).value)
}

function remove() {
  delete instanceMap.value[id]
}

const $q = useQuasar()
const router = useRouter()

function save() {
  const copy = easyDeepClone(current.value)
  instanceMap.value[copy.id] = copy
  $q.notify({
    message: `Instance ${isNew ? 'created' : 'saved'}`,
    color: 'positive'
  })
  if (isNew) {
    nextTick(() => router.replace('/'))
  }
}
</script>
