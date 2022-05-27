import type { Socket } from 'socket.io'
import fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import fastifySocketIo from 'fastify-socket.io'
import { Logger } from 'pino'

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
  private server: FastifyInstance
  private clients: Record<string, IClient>
  private logger: Logger

  constructor(private app: ChiApp) {
    this.clients = Object.create(null)
    this.logger = app.logger.child({ subcomponent: 'webserver' })
    this.server = fastify({ logger: this.logger })
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
      (msg) => socket.send('rpc', msg)
    )
    socket.on('rpc', (msg) => adapter.recv(msg))
    socket.on('disconnect', (reason) => {
      this.logger.info(`Client ${socket.id} disconnected`)
      adapter.dispose(new ClientDisconnectedError(reason))
      delete this.clients[socket.id]
    })
    this.clients[socket.id] = { socket }
  }

  getClient(id: string) {
    if (!(id in this.clients)) {
      throw new Error('Client not found')
    }
    return this.clients[id]
  }
}
