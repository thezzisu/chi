import { Type } from '@chijs/core'
import {
  ActionBuilder,
  PluginBuilder,
  PluginTypeDescriptor
} from '@chijs/runtime'
import { promisify } from 'node:util'
import cp from 'node:child_process'
import { runInNewContext } from 'node:vm'

const exec = promisify(cp.exec)

const evalAction = new ActionBuilder<EvalDescriptor>()
  .name('eval')
  .desc('Evaluate a snippet of JavaScript code')
  .params(
    Type.Object({
      code: Type.String()
    })
  )
  .build(async (ctx, params) => {
    const result = runInNewContext(params.code)
    return result
  })

const execAction = new ActionBuilder<EvalDescriptor>()
  .name('exec')
  .desc('Execute a command')
  .params(
    Type.Object({
      cmd: Type.String()
    })
  )
  .return(
    Type.Object({
      stdout: Type.String(),
      stderr: Type.String()
    })
  )
  .build(async (ctx, params) => {
    return await exec(params.cmd)
  })

interface Actions {
  eval: typeof evalAction
  exec: typeof execAction
}

type EvalDescriptor = PluginTypeDescriptor<{}, {}, Actions>

declare module '@chijs/core' {
  interface IPluginDescriptors {
    '@chijs/plugin-eval': EvalDescriptor
  }
}

export default new PluginBuilder<EvalDescriptor>().build(async (ctx) => {
  ctx.registerAction('eval', evalAction)
  ctx.registerAction('exec', execAction)
})
