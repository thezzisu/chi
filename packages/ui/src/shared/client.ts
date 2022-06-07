import { AgentDescriptor, ChiClient, io, RpcEndpoint } from '@chijs/client'
import { ref } from 'vue'
import { Dialog, Notify } from 'quasar'

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

export function useClient(url: string, token: string) {
  const socket = io(url, {
    auth: {
      token
    }
  })
  const connected = ref(false)
  const message = ref('Connecting')
  socket.on('connect', () => {
    client = new ChiClient(socket)
    applyActions(client)
    connected.value = true
  })
  socket.on('disconnect', (reason) => {
    client.dispose(new Error('Socket disconnected'))
    connected.value = false
    message.value = reason
  })
  socket.on('connect_error', (err) => {
    connected.value = false
    message.value = `${err.name}: ${err.message}`
  })
  return { socket, message, connected }
}

export function getClient() {
  return client
}
