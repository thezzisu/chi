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
