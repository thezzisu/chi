import { definePlugin, Type } from '@chijs/runtime'

export default definePlugin({
  params: {
    foo: Type.String()
  },
  main(ctx, params) {
    ctx.logger.error(`I got params foo=${params.foo}`)
    console.table(await ctx.plugin.list())
    console.table(await ctx.service.list())
  }
})
