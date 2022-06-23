import { definePlugin, PluginDescriptorOf } from '@chijs/app'
import { RpcTypeDescriptor } from '@chijs/rpc'
import { Type } from '@chijs/util'

type FooURD = RpcTypeDescriptor<
  {
    foo(bar: string): Promise<number>
    bar(a: string, b: string): Promise<string>
  },
  {}
>

const plugin = definePlugin((b) =>
  b
    .params(
      Type.Object({
        foo: Type.String(),
        wait: Type.String()
      })
    )
    .action('#onload', (b) =>
      b.build(async (ctx) => {
        const service = await ctx
          .plugin('~/foo.ts')
          .unit('foo')
          .create('plugin-foo-1', { wait: '123' })
        await ctx.api.service.start(service.id)
        ctx.logger.info('plugin-foo-1 started')
      })
    )
    .action('sumer', (b) =>
      b
        .name('sumer')
        .params(Type.Object({ nums: Type.Array(Type.Number()) }))
        .result(Type.Number())
        .build(async (ctx, params) => params.nums.reduce((a, b) => a + b))
    )
    .action('quiz', (b) =>
      b
        .name('Simple Quiz')
        .description('# A simple quiz')
        .result(Type.Boolean())
        .build(async (ctx) => {
          const a = await ctx.agent.prompt('input a number:')
          const b = parseInt(a, 10)
          if (isNaN(b)) {
            await ctx.agent.alert('invalid input')
            throw new Error('Fucked!')
          }
          const c = await ctx.agent.prompt('input another number:')
          const d = parseInt(c, 10)
          const result = await ctx
            .self()
            .action('sumer')
            .run({ nums: [1, 2, 3] })
          ctx.agent.notify(`result = ${result}`)
          return b === d
        })
    )
    .unit('foo', (b) =>
      b
        .attach<FooURD>()
        .params(Type.Object({ wait: Type.Optional(Type.String()) }))
        .build(async (ctx, params) => {
          ctx.endpoint.provide('foo', (bar) => +bar)
          ctx.endpoint.provide('bar', (a, b) => `${a} + ${b}!`)
          ctx.logger.info(params)
          ctx.logger.info(ctx.params)
        })
    )
    .build()
)

declare module '@chijs/app' {
  interface IPluginDescriptors {
    '~/foo.ts': PluginDescriptorOf<typeof plugin>
  }
}

export default plugin
