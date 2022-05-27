import {
  PluginBuilder,
  Type,
  PluginTypeDescriptor,
  DescriptorOf
} from '@chijs/runtime'

type SelfDescriptor = PluginTypeDescriptor<
  {
    foo(bar: string): number
    fucker(a: string, b: string): string
  },
  {}
>

declare module '@chijs/core' {
  interface IPluginDescriptors {
    '~/plugin.ts': SelfDescriptor
  }
}

export default new PluginBuilder<SelfDescriptor>()
  .param('foo', Type.String())
  .param('wait', Type.String())
  .build(async (ctx, params) => {
    ctx.endpoint.provide('foo', (bar) => +bar)
    ctx.endpoint.provide('fucker', (a, b) => `${a} fucks ${b}!`)
    if (params.wait) {
      const proxy = await ctx.getServiceProxy<DescriptorOf<'~/plugin.ts'>>(
        params.wait
      )
      await proxy.internal.waitReady()
    } else {
      // wait for 2 sec
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
    const plugins = await ctx.plugin.list()
    console.table(plugins)
    console.log(params)
    const proxy = await ctx.getServiceProxy<DescriptorOf<'~/plugin.ts'>>('test')
    console.log(await proxy.foo('123'))
    console.log(await proxy.fucker('hello', 'world'))
  })
