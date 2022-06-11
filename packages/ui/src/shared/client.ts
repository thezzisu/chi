import { AgentDescriptor, ChiClient, io, RpcEndpoint } from '@chijs/client'
import { ref, toRaw } from 'vue'
import { Dialog, Notify } from 'quasar'
import { getInstance, Instance } from './instance'

function applyActions(client: ChiClient) {
  const endpoint = client.endpoint as RpcEndpoint<AgentDescriptor>
  endpoint.provide('$a:notify', (ctx, options) => {
    Notify.create(options)
  })
  endpoint.provide('$a:alert', (ctx, options) => {
    if (typeof options === 'string') {
      Dialog.create({
        title: 'Alert',
        message: options
      })
    } else {
      Dialog.create({
        title: options.caption,
        message: options.message
      })
    }
  })
  endpoint.provide(
    '$a:confirm',
    (ctx, options) =>
      new Promise((resolve) => {
        Dialog.create(
          Object.assign(
            typeof options === 'string' ? { message: options } : options,
            { cancel: true, persistent: true }
          )
        )
          .onOk(() => {
            resolve(true)
          })
          .onCancel(() => {
            resolve(false)
          })
      })
  )
  endpoint.provide(
    '$a:prompt',
    (ctx, options) =>
      new Promise((resolve, reject) => {
        Dialog.create(
          Object.assign(
            typeof options === 'string' ? { message: options } : options,
            {
              prompt: { model: '', type: 'text' },
              cancel: true,
              persistent: true
            }
          )
        )
          .onOk((data) => {
            resolve(data)
          })
          .onCancel(() => {
            reject(new Error('User cancelled'))
          })
      })
  )
}

let client: ChiClient

async function resolveClientInfo(instance: Instance) {
  if (instance.type === 'remote') {
    return {
      url: instance.url,
      token: instance.token
    }
  }
  const result = await window.bridge?.startServer({
    config: instance.config,
    name: instance.name
  })
  if (!result) throw new Error('Cannot use local instances')
  const [err, value] = result
  if (err) throw err
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return value!
}

export function useInstance(id: string) {
  const instance = toRaw(getInstance(id).value)
  const connected = ref(false)
  const message = ref(instance.type === 'remote' ? 'Connecting' : 'Starting')
  const status = ref('Disconnected')
  resolveClientInfo(instance)
    .then(({ url, token }) => {
      const socket = io(url, {
        auth: {
          token
        }
      })
      socket.on('connect', () => {
        client = new ChiClient(socket)
        applyActions(client)
        connected.value = true
        status.value = 'Connected ' + socket.id
      })
      socket.on('disconnect', (reason) => {
        client.dispose(new Error('Socket disconnected'))
        connected.value = false
        message.value = reason
        status.value = 'Disconnected'
      })
      socket.on('connect_error', (err) => {
        connected.value = false
        message.value = `${err.name}: ${err.message}`
      })
    })
    .catch((err) => {
      message.value = err.message
    })
  return { status, message, connected }
}

export function getClient() {
  return client
}
