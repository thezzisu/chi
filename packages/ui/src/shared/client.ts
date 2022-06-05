import { ChiClient, io } from '@chijs/client'
import { ref } from 'vue'

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
    connected.value = true
  })
  socket.on('disconnect', (reason) => {
    client.endpoint.dispose(new Error('Socket disconnected'))
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
