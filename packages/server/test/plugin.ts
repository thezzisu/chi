import { PluginBuilder, Type } from '@chijs/runtime'

declare module '@chijs/core' {
  interface IPluginInjections {
    '~/plugin.ts': {
      rpc: {
        foo(bar: string): number
      }
    }
  }
}

export default new PluginBuilder<'~/plugin.ts'>()
  .param('foo', Type.String())
  .build(async (ctx, params) => {
    const plugins = await ctx.plugin.list()
    console.table(plugins)
    console.log(params)
    ctx.registerRpc('foo', (bar) => +bar)
    const handle = ctx.service.getHandle<'~/plugin.ts'>('test')
    console.log(await handle.foo('123'))
  })
