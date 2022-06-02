import type { Socket } from 'socket.io'
import fastify from 'fastify'
import cors from '@fastify/cors'
import fastifySocketIo from 'fastify-socket.io'

import type { ChiApp } from '../index.js'
import { RpcId } from '@chijs/core'

export interface IClient {
  socket: Socket
}

export class ClientDisconnectedError extends Error {
  constructor(public reason: string) {
    super(`Client disconnected: ${reason}`)
    this.name = 'ClientDisconnectedError'
  }
}

export class WebServer {
  private server
  private logger
  private clients

  constructor(private app: ChiApp) {
    this.logger = app.logger.child({ subcomponent: 'webserver' })
    this.server = fastify({ logger: this.logger })
    this.clients = new Map<string, IClient>()
  }

  async start() {
    await this.server.register(cors, { origin: true })
    await this.server.register(fastifySocketIo, {
      cors: {
        origin: true
      }
    })
    this.server.io.use((socket, next) => {
      return next()
    })
    this.server.io.on('connection', this.onConnection.bind(this))
    await this.server.listen(3000)
  }

  private onConnection(socket: Socket) {
    this.logger.info(`Client ${socket.id} connected`)
    const adapter = this.app.rpcManager.router.createAdapter(
      RpcId.client(socket.id),
      (msg) => socket.emit('rpc', msg)
    )
    socket.on('rpc', (msg) => adapter.recv(msg))
    socket.on('disconnect', (reason) => {
      this.logger.info(`Client ${socket.id} disconnected`)
      adapter.dispose(new ClientDisconnectedError(reason))
      this.clients.delete(socket.id)
    })
    this.clients.set(socket.id, { socket })
  }

  getClient(id: string) {
    const client = this.clients.get(id)
    if (!client) throw new Error('Client not found')
    return client
  }
}
