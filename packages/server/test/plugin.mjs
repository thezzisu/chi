import { PluginBuilder, Type } from '@chijs/runtime'

export default new PluginBuilder()
  .param('foo', Type.String())
  .build((ctx, params) => {
    console.log(params)
  })
