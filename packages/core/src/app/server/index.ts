import type { Socket } from 'socket.io'
import fastify, { FastifyInstance } from 'fastify'
import fastifySocketIo from 'fastify-socket.io'
import { Logger } from 'pino'
import { ChiApp } from '../index.js'
import { RpcHub } from '../../rpc/hub.js'
import type { IClientRpcFns } from '../../client/index.js'
import { IAppClientApiFns } from '../api/index.js'

export interface IClient {
  socket: Socket
  hub: RpcHub<IClientRpcFns, IAppClientApiFns>
}

export class ClientDisconnectedError extends Error {
  constructor(public reason: string) {
    super(`Client disconnected: ${reason}`)
    this.name = 'ClientDisconnectedError'
  }
}

export class ApiServer {
  private server: FastifyInstance
  private clients: Record<string, IClient>
  private logger: Logger

  constructor(private app: ChiApp) {
    this.clients = Object.create(null)
    this.logger = app.logger.child({ subcomponent: 'webserver' })
    this.server = fastify({ logger: this.logger })
  }

  async start() {
    await this.server.register(fastifySocketIo, {})
    this.server.io.use((socket, next) => {
      return next()
    })
    this.server.io.on('connection', this.onConnection.bind(this))
    await this.server.listen(3000)
  }

  private onConnection(socket: Socket) {
    this.logger.info(`Client ${socket.id} connected`)
    const hub = new RpcHub<IClientRpcFns, IAppClientApiFns>(
      (msg) => void socket.emit('rpc', msg),
      this.app.apiManager.impls.clientImpl
    )
    socket.on('rpc', (msg) => hub.handle(msg))
    socket.on('disconnect', (reason) => {
      this.logger.info(`Client ${socket.id} disconnected`)
      hub.dispose(new ClientDisconnectedError(reason))
      delete this.clients[socket.id]
    })
    this.clients[socket.id] = { socket, hub }
  }

  getClient(id: string) {
    if (!(id in this.clients)) {
      throw new Error('Client not found')
    }
    return this.clients[id]
  }
}
