import fastifyCors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import fastify from 'fastify'
import { join } from 'node:path'
import type { Socket } from 'socket.io'
import { ChiServer } from '../index.js'
import { resolveModule } from '../../util/index.js'
import fastifySocketIo from './io.js'

type Origin = boolean | string | RegExp | (boolean | string | RegExp)[]

export interface IWebConfig {
  token?: string
  origin?: Origin
  port?: number
  address?: string
  ui?: string
}

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
  private config

  constructor(private app: ChiServer) {
    this.config = app.config.web
    this.logger = app.logger.child({ subcomponent: 'webserver' })
    this.server = fastify({ logger: this.logger })
    this.clients = new Map<string, IClient>()
  }

  async start() {
    await this.server.register(fastifyStatic, {
      root:
        this.config.ui ??
        join(resolveModule('@chijs/ui/package.json'), '..', 'dist', 'spa')
    })
    await this.server.register(fastifyCors, {
      origin: this.config.origin ?? true
    })
    await this.server.register(fastifySocketIo, {
      cors: {
        origin: this.config.origin ?? true
      }
    })
    this.server.io.use((socket, next) => {
      if (
        this.config.token &&
        socket.handshake.auth.token !== this.config.token
      ) {
        return next(new Error('Unauthorized'))
      }
      return next()
    })
    this.server.io.on('connection', this.onConnection.bind(this))
    const result = await this.server.listen(
      this.config.port ?? 3000,
      this.config.address
    )
    this.logger.error(`Web server listening on ${result}`)
  }

  private onConnection(socket: Socket) {
    this.logger.info(`Client ${socket.id} connected`)
    const adapter = this.app.rpc.router.createAdapter(socket.id, (msg) =>
      socket.emit('rpc', msg)
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
