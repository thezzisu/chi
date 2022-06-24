<template>
  <q-page padding class="column justify-center items-center">
    <q-card style="max-width: 640px; min-width: 320px">
      <q-card-section>
        <div class="row items-center">
          <div class="q-pr-sm">
            <q-btn flat padding="xs" icon="mdi-arrow-left" to="/" />
          </div>
          <div v-if="isNew" class="text-h6 col-grow">New Environment</div>
          <div v-else class="text-h6 col-grow">Edit Environment</div>
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
            :options="environmentTypes"
            color="primary"
            inline
          />
        </div>
        <template v-if="current.type === 'remote'">
          <q-input v-model="current.url" label="URL" />
          <q-input v-model="current.token" label="Token" />
        </template>
        <template v-else>
          <q-input v-model="current.config" label="Config path">
            <template #append>
              <q-btn
                icon="mdi-file-cog-outline"
                flat
                round
                color="primary"
                @click="selectFile"
              />
            </template>
          </q-input>
        </template>
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
import {
  easyDeepClone,
  getEnvironment,
  environmentMap,
  Environment,
  environmentTypes,
  selectConfig
} from 'src/shared'
import { useQuasar } from 'quasar'

const route = useRoute()
const id = <string>route.params.id
const isNew = !id

const newEnvironment: Environment = {
  id: nanoid(),
  name: 'New Environment',
  desc: '',
  type: 'remote',
  url: 'ws://localhost:3000',
  token: ''
}

const current = ref(
  easyDeepClone(isNew ? newEnvironment : getEnvironment(id).value)
)

function reset() {
  current.value = easyDeepClone(
    isNew ? newEnvironment : getEnvironment(id).value
  )
}

const $q = useQuasar()
const router = useRouter()

function remove() {
  $q.dialog({
    title: 'Confirm',
    message: `Are you sure to delete ${current.value.name}`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    delete environmentMap.value[id]
    $q.notify({
      message: 'Environment Deleted',
      color: 'positive'
    })
    router.replace('/')
  })
}

function save() {
  const copy = easyDeepClone(current.value)
  environmentMap.value[copy.id] = copy
  $q.notify({
    message: `Environment ${isNew ? 'created' : 'saved'}`,
    color: 'positive'
  })
  if (isNew) {
    nextTick(() => router.replace('/'))
  }
}

async function selectFile() {
  const file = await selectConfig()
  if (file && current.value.type === 'local') {
    current.value.config = file
  }
}
</script>
