import { PluginBuilder, PluginDescriptorOf } from '../src/index.js'
import {} from '@chijs/injection'

const plugin = new PluginBuilder()
  .name('123')
  .params((Type) =>
    Type.Object({
      bar: Type.String()
    })
  )
  .action('test', (builder) =>
    builder
      .params((Type) => Type.Object({ foo: Type.Number() }))
      .result((Type) => Type.String())
      .build((ctx, params) => {
        return `${ctx.params.bar}: ${params.foo}`
      })
  )
  .build()

declare module '@chijs/injection' {
  interface IPluginDescriptors {
    some: PluginDescriptorOf<typeof plugin>
  }
}
