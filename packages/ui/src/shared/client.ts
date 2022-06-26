import { ChiClient, io } from '@chijs/client'
import { ref, toRaw } from 'vue'
import { Dialog, Notify } from 'quasar'
import { getEnvironment, Environment } from './environment'
import type { RpcEndpoint } from '@chijs/rpc'
import type { AgentDescriptor } from '@chijs/app'

function applyActions(client: ChiClient) {
  const endpoint = client.endpoint as unknown as RpcEndpoint<AgentDescriptor>
  endpoint.provide('#action:notify', (ctx, options) => {
    Notify.create(options)
  })
  endpoint.provide('#action:alert', (ctx, options) => {
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
    '#action:confirm',
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
    '#action:prompt',
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

async function resolveClientInfo(env: Environment) {
  if (env.type === 'remote') {
    return {
      url: env.url,
      token: env.token
    }
  }
  const result = await window.bridge?.startServer({
    config: env.config,
    name: env.name
  })
  if (!result) throw new Error('Cannot use local environments')
  const [err, value] = result
  if (err) throw err
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return value!
}

export function useEnvironment(id: string) {
  const env = toRaw(getEnvironment(id).value)
  const connected = ref(false)
  const message = ref(env.type === 'remote' ? 'Connecting' : 'Starting')
  const status = ref('Disconnected')
  resolveClientInfo(env)
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
