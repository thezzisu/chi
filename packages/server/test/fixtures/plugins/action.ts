import { AgentDescriptor, RpcEndpoint } from '@chijs/core'
import {
  ActionBuilder,
  ActionsOf,
  Built,
  PluginBuilder,
  PluginTypeDescriptor,
  Type
} from '@chijs/runtime'

const sample = new ActionBuilder()
  .param('msg', Type.String())
  .return(Type.Number())

const add = new ActionBuilder()
  .param('nums', Type.Array(Type.Number()))
  .return(Type.Number())
  .build((ctx, params) => params.nums.reduce((acc, cur) => acc + cur))

type Self = PluginTypeDescriptor<
  {},
  {},
  {
    sample: Built<typeof sample>
    add: typeof add
  }
>

declare module '@chijs/core' {
  interface IPluginDescriptors {
    '~/action.ts': Self
  }
}

export default new PluginBuilder<Self>()
  .param('hello', Type.String())
  .build(async (ctx, params) => {
    console.log(params.hello)
    ctx.registerAction(
      'sample',
      sample.build(async (ctx, params) => {
        try {
          await ctx.agent.notify('lalala')
        } catch (e) {
          console.log(e)
        }
        const result = await ctx
          .use<ActionsOf<'~/action.ts'>>('action')
          .run('add', { nums: [1, 2, 3] })
        console.log(`1+2+3=${result}`)
        console.log(params.msg)
        return 1
      })
    )
    ctx.registerAction('add', add)
    const agent = ctx.endpoint as RpcEndpoint<AgentDescriptor>
    agent.provide('$a:notify', (options) => console.log(`Notified: ${options}`))
    setTimeout(async () => {
      try {
        const id = await ctx.action.dispatch('action', 'sample', {
          msg: 'Example action'
        })
        ctx.server.subscribe(
          '$s:action:taskUpdate',
          (data, err) => console.log(`UPD:`, data, err),
          id
        )
        console.log(`Created task ${id}`)
      } catch (e) {
        console.log(e)
      }
    }, 1000)
  })
