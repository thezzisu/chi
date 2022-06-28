import { RpcId } from '@chijs/rpc'
import { createLogger, uniqueId, validateSchema } from '@chijs/util'
import { EventEmitter } from 'node:events'
import { join } from 'node:path'
import { ActionTask } from '../db/task.js'
import { ChiServer } from '../index.js'
import { ChiWorker } from '../worker/index.js'

export type JobState = 'initializing' | 'running' | 'success' | 'failed'

export interface IJobInfo {
  id: string
  parent: string | null
  pluginId: string
  actionId: string
  params: unknown
  return: unknown
  state: JobState
  created: number
  finished: number
  logPath: string | null
}

export interface IRunningTask {
  initiator: RpcId
  task: ActionTask
}

export class ActionManager extends EventEmitter {
  private manager
  private running
  private logger

  constructor(private app: ChiServer) {
    super()
    this.manager = app.db.ds.manager
    this.running = new Map<string, IRunningTask>()
    this.logger = createLogger('action-manager', {}, this.app.logger)
  }

  async dispatch(
    initiator: RpcId,
    pluginId: string,
    actionId: string,
    params: unknown
  ) {
    const plugin = this.app.plugins.getOrFail(pluginId)
    if (!Object.hasOwn(plugin.actions, actionId))
      throw new Error(`Action ${actionId} not found`)

    let task = new ActionTask()
    task.id = uniqueId()
    task.pluginId = pluginId
    task.actionId = actionId
    task.state = 'running'
    task.jobs = []
    task.created = Date.now()
    task.finished = 0
    task = await this.manager.save(task)
    this.running.set(task.id, { initiator, task })
    this.run(task.id, null, pluginId, actionId, params).catch(() => {})
    return task.id
  }

  async run(
    taskId: string,
    parent: string | null,
    pluginId: string,
    actionId: string,
    params: unknown
  ) {
    const plugin = this.app.plugins.getOrFail(pluginId)
    const action = plugin.actions[actionId]
    if (!action) throw new Error(`Action ${actionId} not found`)

    const info = this.running.get(taskId)
    if (!info) throw new Error(`Task ${taskId} not found`)
    const { initiator, task } = info
    const jobId = uniqueId()
    const logPath =
      this.app.config.log.path &&
      join(
        this.app.config.log.path,
        'action',
        taskId,
        `${pluginId}-${actionId}-${jobId}.log`
      )
    const job: IJobInfo = {
      id: jobId,
      parent,
      pluginId,
      actionId,
      params,
      return: null,
      state: 'initializing',
      created: Date.now(),
      finished: 0,
      logPath
    }
    task.jobs.push(job)
    await this.manager.save(task)
    this.emit(taskId, task)
    let toThrow
    let worker: ChiWorker | undefined
    try {
      if (validateSchema(params, action.params).length) {
        throw new Error('Bad params')
      }

      worker = this.app.workers.fork({
        rpcId: jobId,
        logPath,
        logger: this.logger,
        level: this.app.config.log.level
      })
      const handle = worker.getHandle()
      await handle.call('#worker:waitForBootstrap')
      job.state = 'running'
      await this.manager.save(task)
      this.emit(taskId, task)

      const result = await handle.call('#worker:runAction', {
        pluginId,
        actionId,
        taskId,
        jobId,
        initiator,
        params,
        pluginParams: plugin.actualParams,
        resolved: plugin.resolved
      })
      job.return = result
      job.state = 'success'
    } catch (err) {
      job.return = err instanceof Error ? err.message : err
      job.state = 'failed'
      toThrow = err
    }
    worker?.exit()
    job.finished = Date.now()
    if (!parent) {
      task.state = job.state
      task.finished = job.finished
    }
    await this.manager.save(task)
    this.emit(taskId, task)
    if (!parent) {
      this.running.delete(taskId)
    }
    if (toThrow) throw toThrow
    return job.return
  }

  has(taskId: string) {
    return this.running.has(taskId)
  }
}
