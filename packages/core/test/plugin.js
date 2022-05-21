import '../lib/app/service/worker.js'

// export default new PluginBuilder()
//   .param('foo', Type.String())
//   .build((ctx, params) => {
//     console.log(ctx)
//     console.log(params)
//     ctx.logger.error(params.foo)
//   })

export default {
  params: {},
  main(ctx, params) {
    console.log(ctx)
    console.log(params)
    ctx.logger.error(params.foo)
  }
}
