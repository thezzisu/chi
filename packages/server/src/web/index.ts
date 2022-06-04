import type { Socket } from 'socket.io'
import type { ChiApp } from '../index.js'
import { RPC } from '@chijs/core'
import fastify from 'fastify'
import cors from '@fastify/cors'
import fastifySocketIo from 'fastify-socket.io'

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
      if (
        this.app.config.web.token &&
        socket.handshake.auth.token !== this.app.config.web.token
      ) {
        return next(new Error('Unauthorized'))
      }
      return next()
    })
    this.server.io.on('connection', this.onConnection.bind(this))
    await this.server.listen(3000)
  }

  private onConnection(socket: Socket) {
    this.logger.info(`Client ${socket.id} connected`)
    const adapter = this.app.rpc.router.createAdapter(
      RPC.client(socket.id),
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
