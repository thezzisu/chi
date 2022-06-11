import fp from 'fastify-plugin'
import { Server, ServerOptions } from 'socket.io'

declare module 'fastify' {
  interface FastifyInstance {
    io: Server
  }
}

export default fp<Partial<ServerOptions>>(async function (fastify, opts) {
  fastify.decorate('io', new Server(fastify.server, opts))
  fastify.addHook('onClose', (fastify, done) => {
    fastify.io.close()
    done()
  })
})
