import {
  IActionInfoWithService,
  RPC,
  RpcEndpoint,
  ServerDescriptor,
  ServiceState,
  WorkerDescriptor
} from '@chijs/core'
import { ActionTask } from '../db/task.js'
import { ChiApp } from '../index.js'

export function applyActionImpl(
  endpoint: RpcEndpoint<ServerDescriptor>,
  app: ChiApp
) {
  const Tasks = app.db.ds.manager.getRepository(ActionTask)

  endpoint.provide(
    '$s:action:dispatch',
    function (serviceId, actionId, params) {
      return app.actions.dispatch(this.remoteId, serviceId, actionId, params)
    }
  )

  endpoint.provide(
    '$s:action:run',
    (taskId, parent, serviceId, actionId, params) => {
      return app.actions.run(taskId, parent, serviceId, actionId, params)
    }
  )

  endpoint.provide('$s:action:get', async (serviceId, actionId) => {
    const service = app.services.get(serviceId)
    if (!service) throw new Error(`service ${serviceId} not found`)
    if (service.state !== ServiceState.RUNNING || !service.workerId)
      throw new Error(`service ${serviceId} not running`)
    const handle = app.rpc.endpoint.getHandle<WorkerDescriptor>(
      RPC.worker(service.workerId)
    )
    const action = await handle.call('$w:action:get', actionId)
    return { serviceId, ...action }
  })

  endpoint.provide('$s:action:list', async () => {
    const services = app.services
      .list()
      .filter((s) => s.state === ServiceState.RUNNING)
    const result: IActionInfoWithService[] = []
    for (const service of services) {
      if (!service.workerId) continue
      try {
        const handle = app.rpc.endpoint.getHandle<WorkerDescriptor>(
          RPC.worker(service.workerId)
        )
        const list = await handle.call('$w:action:list')
        result.push(...list.map((item) => ({ ...item, serviceId: service.id })))
      } catch (e) {
        app.logger.error(e)
      }
    }
    return result
  })

  endpoint.provide('$s:action:listByService', async (serviceId) => {
    const service = app.services.get(serviceId)
    if (!service) throw new Error(`service ${serviceId} not found`)
    if (service.state !== ServiceState.RUNNING || !service.workerId)
      throw new Error(`service ${serviceId} not running`)
    const handle = app.rpc.endpoint.getHandle<WorkerDescriptor>(
      RPC.worker(service.workerId)
    )
    const actions = await handle.call('$w:action:list')
    return actions.map((item) => ({ ...item, serviceId }))
  })

  endpoint.provide('$s:action:getTask', async (id) => {
    const task = await Tasks.findOneByOrFail({ id })
    return task
  })

  endpoint.provide('$s:action:listTask', async () => {
    const tasks = await Tasks.find()
    return tasks
  })

  endpoint.provide('$s:action:listTaskByService', async (serviceId) => {
    const tasks = await Tasks.find({ where: { serviceId } })
    return tasks
  })

  endpoint.provide(
    '$s:action:listTaskByAction',
    async (serviceId, actionId) => {
      const tasks = await Tasks.find({ where: { serviceId, actionId } })
      return tasks
    }
  )

  endpoint.publish('$s:action:taskUpdate', (cb, taskId) => {
    if (!app.actions.running.has(taskId))
      throw new Error(`Task ${taskId} not found or not running`)
    app.actions.emitter.on(taskId, cb)
    return () => {
      app.actions.emitter.off(taskId, cb)
    }
  })
}
