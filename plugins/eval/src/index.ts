import { definePlugin, PluginDescriptorOf } from '@chijs/app'
import spawn from 'cross-spawn'
import cp from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { runInNewContext } from 'node:vm'

const exec = promisify(cp.exec)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const plugin = definePlugin((p) =>
  p
    .name('Eval')
    .description(readFileSync(join(root, 'README.md'), 'utf8'))
    .params((type) =>
      type.Object({
        shell: type.Optional(type.String())
      })
    )
    .action('eval', (action) =>
      action
        .name('Eval')
        .description('Evaluate javascript code')
        .params((type) => type.Object({ code: type.String() }))
        .result((type) => type.Unknown())
        .build((ctx, { code }) => {
          return runInNewContext(code)
        })
    )
    .action('exec', (action) =>
      action
        .name('Exec')
        .description('Execute a command')
        .params((type) => type.Object({ command: type.String() }))
        .result((type) =>
          type.Object({
            stdout: type.String(),
            stderr: type.String()
          })
        )
        .build((ctx, { command }) => {
          return exec(command)
        })
    )
    .action('spawn', (action) =>
      action
        .name('Spawn')
        .description('Spawn a process')
        .params((type) =>
          type.Object({
            serviceId: type.Optional(type.String()),
            command: type.Optional(type.String()),
            args: type.Optional(type.Array(type.String()))
          })
        )
        .result((type) => type.String())
        .build(async (ctx, params) => {
          const serviceId =
            params.serviceId ?? (await ctx.agent.prompt('Create as service:'))
          const command = params.command ?? (await ctx.agent.prompt('Command:'))
          const service = await ctx
            .self<Descriptor>()
            .unit('spawn')
            .create(serviceId, { command, args: params.args })
          await service.start()
          const id: string = service.id
          return id
        })
    )
    .unit('spawn', (unit) =>
      unit
        .name('Spawn')
        .description('Run a command as service')
        .params((type) =>
          type.Object({
            command: type.String(),
            args: type.Optional(type.Array(type.String()))
          })
        )
        .build((ctx, params) => {
          spawn(params.command, params.args, { stdio: 'inherit' })
        })
    )
    .build()
)

type Descriptor = PluginDescriptorOf<typeof plugin>

declare module '@chijs/app' {
  interface IPluginDescriptors {
    '@chijs/plugin-eval': Descriptor
  }
}

export default plugin
