import { PluginBuilder, Type } from '@chijs/runtime'

declare module '@chijs/core' {
  interface IPluginInjections {
    '~/plugin.ts': {
      rpc: {
        foo(bar: string): number
        fucker(a: string, b: string): string
      }
    }
  }
}

export default new PluginBuilder<'~/plugin.ts'>()
  .param('foo', Type.String())
  .param('wait', Type.String())
  .build(async (ctx, params) => {
    if (params.wait) {
      const handle = ctx.service.getHandle<'~/plugin.ts'>(params.wait)
      await handle.waitReady()
    } else {
      // wait for 2 sec
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
    const plugins = await ctx.plugin.list()
    console.table(plugins)
    console.log(params)
    ctx.registerRpc('foo', (bar) => +bar)
    ctx.registerRpc('fucker', (a, b) => `${a} fucks ${b}!`)
    const handle = ctx.service.getHandle<'~/plugin.ts'>('test')
    console.log(await handle.foo('123'))
    console.log(await handle.fucker('hello', 'world'))
  })
