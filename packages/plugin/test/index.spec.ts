import { Type } from '@chijs/util'
import { PluginBuilder, PluginDescriptorOf } from '../src/index.js'
import {} from '@chijs/injection'

const plugin = new PluginBuilder()
  .name('123')
  .action('test', (builder) =>
    builder
      .params(Type.Object({ foo: Type.Number() }))
      .result(Type.String())
      .build((ctx, params) => `${params.foo}`)
  )
  .build()

declare module '@chijs/injection' {
  interface IPluginDescriptors {
    some: PluginDescriptorOf<typeof plugin>
  }
}
