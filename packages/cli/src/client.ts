import { ChiClient, io } from '@chijs/client'
import chalk from 'chalk'
import repl from 'node:repl'

const CLI_CONNECT_ERROR = 1
const CLI_DISCONNECT = 2

export function startClient(options: { url: string; token?: string }) {
  const socket = io(options.url, { auth: { token: options.token ?? '' } })
  socket.on('connect', () => {
    console.log(chalk.green('Connected to Chi server'))
    console.log(chalk.yellow('Socket ID: ') + chalk.whiteBright(socket.id))
    const client = new ChiClient(socket)
    const sess = repl.start({
      prompt: `${chalk.blue('chi')} ${chalk.green('>')} `,
      breakEvalOnSigint: true
    })
    const apply = () =>
      Object.defineProperty(sess.context, 'client', {
        value: client,
        configurable: false,
        enumerable: true
      })
    apply()
    sess.on('reset', apply)
    sess.on('exit', () => {
      process.exit()
    })
  })
  socket.on('disconnect', (reason) => {
    console.error(chalk.red(`Disconnected: ${reason}`))
    process.exit(CLI_DISCONNECT)
  })
  socket.on('connect_error', (err) => {
    console.log(chalk.red(`Connect Error: ${err.message}`))
    console.log(err.stack)
    process.exit(CLI_CONNECT_ERROR)
  })
}
