import { ChiClient, io } from '@chijs/client'
import { ref } from 'vue'

let client: ChiClient

export function useClient(url: string) {
  const socket = io(url)
  const connected = ref(false)
  socket.on('connect', () => {
    client = new ChiClient(socket)
    connected.value = true
  })
  socket.on('disconnect', () => {
    client.endpoint.dispose(new Error('Socket disconnected'))
    connected.value = false
  })
  return { socket, connected }
}

export function getClient() {
  return client
}
