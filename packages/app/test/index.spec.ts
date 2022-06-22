import { RpcTypeDescriptor } from '@chijs/rpc'
import { Type } from '@chijs/util'
import { definePlugin, PluginDescriptorOf } from '../src/index.js'

type SomeUnitDescriptor = RpcTypeDescriptor<
  {
    whatIsMyName(): string
  },
  {}
>

const plugin = definePlugin((plugin) =>
  plugin
    .params(Type.Object({ foo: Type.String() }))
    .action('some-action', (action) =>
      action
        .params(Type.Object({ name: Type.String() }))
        .result(Type.String())
        .build(async (ctx, params) => {
          return `${ctx.params.foo} welcomes ${params.name}`
        })
    )
    .unit('some-unit', (unit) =>
      unit
        .attach<SomeUnitDescriptor>()
        .params(Type.Object({ name: Type.String() }))
        .build((ctx, params) => {
          ctx.endpoint.provide('whatIsMyName', () => params.name)
        })
    )
    .build()
)

declare module '../src/index.js' {
  interface IPluginDescriptors {
    somePlugin: PluginDescriptorOf<typeof plugin>
  }
}

export default plugin
