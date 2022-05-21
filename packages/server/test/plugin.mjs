import { PluginBuilder, Type } from '@chijs/runtime'

export default new PluginBuilder()
  .param('foo', Type.String())
  .build(async (ctx, params) => {
    const plugins = await ctx.plugin.list()
    console.table(plugins)
    console.log(params)
  })
