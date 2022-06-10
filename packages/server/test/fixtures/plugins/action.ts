import { Type } from '@chijs/core'
import { AgentDescriptor, RpcEndpoint } from '@chijs/core'
import {
  ActionBuilder,
  ActionsOf,
  Built,
  PluginBuilder,
  PluginTypeDescriptor
} from '@chijs/runtime'

const sample = new ActionBuilder()
  .params(Type.Object({ msg: Type.String() }))
  .return(Type.Number())

const add = new ActionBuilder()
  .params(Type.Object({ nums: Type.Array(Type.Number()) }))
  .return(Type.Number())
  .build((ctx, params) => params.nums.reduce((acc, cur) => acc + cur))

const echo = new ActionBuilder().build(async (ctx) => {
  const msg = await ctx.agent.prompt('Enter a message:')
  ctx.agent.notify(msg)
})

type Self = PluginTypeDescriptor<
  {},
  {},
  {
    sample: Built<typeof sample>
    add: typeof add
    echo: typeof echo
  }
>

declare module '@chijs/core' {
  interface IPluginDescriptors {
    '~/action.ts': Self
  }
}

export default new PluginBuilder<Self>()
  .params(Type.Object({ hello: Type.String() }))
  .build(async (ctx, params) => {
    console.log(ctx.agent.remoteId)
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
    ctx.registerAction('echo', echo)
    ctx.registerAction(
      'test1',
      new ActionBuilder().build(async (ctx) => {
        await ctx.use('action').run('test2', {})
        await ctx.use('action').run('test2', {})
        await ctx.use('action').run('test2', {})
        await ctx.use('action').run('test2', {})
      })
    )
    ctx.registerAction(
      'test2',
      new ActionBuilder().build(async (ctx) => {
        await ctx.use('action').run('test3', {})
        await ctx.use('action').run('test3', {})
        await ctx.use('action').run('test3', {})
        await ctx.use('action').run('test3', {})
      })
    )
    ctx.registerAction(
      'test3',
      new ActionBuilder().return(Type.Number()).build(async () => {
        return Math.random()
      })
    )
    ctx.action.dispatch('action', 'test1', {}).then((id) => console.log(id))
    const agent = ctx.endpoint as RpcEndpoint<AgentDescriptor>
    agent.provide('$a:notify', (options) => console.log(`Notified: ${options}`))
    setTimeout(async () => {
      try {
        const id = await ctx.action.dispatch('action', 'sample', {
          msg: 'Example action'
        })
        ctx.server.subscribe(
          '$s:task:update',
          (data, err) => console.log(`UPD:`, data, err),
          id
        )
        console.log(`Created task ${id}`)
      } catch (e) {
        console.log(e)
      }
    }, 1000)
  })
