import {
  IJobInfo,
  JobState,
  nanoid,
  RPC,
  WorkerDescriptor,
  RpcId
} from '@chijs/core'
import { EventEmitter } from 'node:events'
import { ActionTask } from '../db/task.js'
import { ChiApp } from '../index.js'

export class ActionManager {
  manager
  running
  emitter

  constructor(private app: ChiApp) {
    this.manager = app.db.ds.manager
    this.running = new Map<string, [RpcId, ActionTask]>()
    this.emitter = new EventEmitter()
  }

  async dispatch(
    initiator: RpcId,
    serviceId: string,
    actionId: string,
    params: unknown
  ) {
    let task = new ActionTask()
    task.id = nanoid()
    task.serviceId = serviceId
    task.actionId = actionId
    task.state = JobState.RUNNING
    task.jobs = []
    task.created = Date.now()
    task.finished = 0
    task = await this.manager.save(task)
    this.running.set(task.id, [initiator, task])
    this.run(task.id, '', serviceId, actionId, params)
    return task.id
  }

  async run(
    taskId: string,
    parent: string,
    serviceId: string,
    actionId: string,
    params: unknown
  ) {
    const info = this.running.get(taskId)
    if (!info) throw new Error(`Task ${taskId} not found`)
    const [initiator, task] = info
    const jobId = nanoid()
    const job: IJobInfo = {
      id: jobId,
      parent,
      serviceId,
      actionId,
      params,
      return: null,
      state: JobState.RUNNING,
      created: Date.now(),
      finished: 0
    }
    task.jobs.push(job)
    await this.manager.save(task)
    this.emitter.emit(taskId, task)
    let toThrow
    try {
      const service = this.app.services.get(serviceId)
      if (!service) throw new Error(`Service ${serviceId} not found`)
      if (!service.workerId) throw new Error(`Service ${serviceId} not running`)
      const handler = this.app.rpc.endpoint.getHandle<WorkerDescriptor>(
        RPC.worker(service.workerId)
      )
      await handler.connect()
      const result = await handler.call(
        '$w:action:run',
        initiator,
        taskId,
        jobId,
        actionId,
        params
      )
      job.return = result
      job.state = JobState.SUCCESS
    } catch (err) {
      job.return = err instanceof Error ? err.message : err
      job.state = JobState.FAILED
      toThrow = err
    }
    job.finished = Date.now()
    if (!parent) {
      task.state = job.state
      task.finished = job.finished
    }
    await this.manager.save(task)
    this.emitter.emit(taskId, task)
    if (!parent) {
      this.running.delete(taskId)
    }
    if (toThrow) throw toThrow
    return job.return
  }
}
