import { RpcEndpoint } from '@chijs/rpc'
import { IChiPluginAction } from '../../plugin/index.js'
import { JobState } from '../action/index.js'
import { ActionTask } from '../db/task.js'
import { ChiServer } from '../index.js'
import { ServerDescriptor } from './base.js'

export interface IActionInfo extends IChiPluginAction {
  id: string
}

export interface IActionProvides {
  list(pluginId?: string): Promise<IActionInfo[]>
  dispatch(pluginId: string, actionId: string, params: unknown): Promise<string>
  run(
    taskId: string,
    jobId: string,
    pluginId: string,
    actionId: string,
    params: unknown
  ): Promise<unknown>
}

export interface ITaskProvides {
  get(id: string): Promise<ActionTask>
  list(pluginId?: string, actionId?: string): Promise<ActionTask[]>
  remove(id: string): Promise<void>
}

export interface ITaskPublishes {
  update(taskId: string): ActionTask
}

export function applyActionImpl(
  e: RpcEndpoint<ServerDescriptor>,
  app: ChiServer
) {
  e.provide('#server:action:list', (pluginId) => {
    const plugins = pluginId ? [app.plugins.get(pluginId)] : app.plugins.list()
    return plugins.flatMap((plugin) =>
      Object.entries(plugin.actions).map(([id, action]) => ({
        id,
        ...action
      }))
    )
  })

  e.provide('#server:action:dispatch', function (pluginId, actionId, params) {
    return app.actions.dispatch(this.remoteId, pluginId, actionId, params)
  })

  e.provide(
    '#server:action:run',
    (taskId, jobId, pluginId, actionId, params) => {
      return app.actions.run(taskId, jobId, pluginId, actionId, params)
    }
  )

  const Tasks = app.db.ds.manager.getRepository(ActionTask)

  e.provide('#server:task:get', async (id) => {
    return Tasks.findOneByOrFail({ id })
  })

  e.provide('#server:task:list', (pluginId, actionId) => {
    return Tasks.find({
      where: {
        pluginId,
        actionId
      }
    })
  })

  e.provide('#server:task:remove', async (id) => {
    const task = await Tasks.findOneByOrFail({ id })
    if (task.state === JobState.SUCCESS || task.state === JobState.FAILED) {
      await Tasks.remove(task)
    } else {
      throw new Error('Task is not finished')
    }
  })
}
