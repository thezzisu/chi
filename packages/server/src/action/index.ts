import { RpcId } from '@chijs/rpc'
import { createLogger, uniqueId } from '@chijs/util'
import { EventEmitter } from 'node:events'
import { join } from 'node:path'
import { ActionTask } from '../db/task.js'
import { ChiApp } from '../index.js'

export enum JobState {
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed'
}

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
  log: string | null
}

export interface IRunningTask {
  initiator: RpcId
  task: ActionTask
}

export class ActionManager {
  manager
  running
  emitter
  logger

  constructor(private app: ChiApp) {
    this.manager = app.db.ds.manager
    this.running = new Map<string, IRunningTask>()
    this.emitter = new EventEmitter()
    this.logger = createLogger('action-manager', {}, this.app.logger)
  }

  async dispatch(
    initiator: RpcId,
    pluginId: string,
    actionId: string,
    params: unknown
  ) {
    let task = new ActionTask()
    task.id = uniqueId()
    task.pluginId = pluginId
    task.actionId = actionId
    task.state = JobState.RUNNING
    task.jobs = []
    task.created = Date.now()
    task.finished = 0
    task = await this.manager.save(task)
    this.running.set(task.id, { initiator, task })
    this.run(task.id, '', pluginId, actionId, params)
    return task.id
  }

  async run(
    taskId: string,
    parent: string | null,
    pluginId: string,
    actionId: string,
    params: unknown
  ) {
    const info = this.running.get(taskId)
    if (!info) throw new Error(`Task ${taskId} not found`)
    const { initiator, task } = info
    const jobId = uniqueId()
    const log =
      this.app.config.log.path &&
      join(
        this.app.config.log.path,
        'action',
        pluginId,
        actionId,
        `${jobId}.log`
      )
    const job: IJobInfo = {
      id: jobId,
      parent,
      pluginId,
      actionId,
      params,
      return: null,
      state: JobState.RUNNING,
      created: Date.now(),
      finished: 0,
      log
    }
    task.jobs.push(job)
    await this.manager.save(task)
    this.emitter.emit(taskId, task)
    let toThrow
    const worker = this.app.workers.fork({
      rpcId: uniqueId(),
      log,
      logger: this.logger
    })
    job.state = JobState.INITIALIZING
    await this.manager.save(task)
    this.emitter.emit(taskId, task)
    try {
      const handle = worker.getHandle()
      await handle.call('waitForBootstrap')
      job.state = JobState.RUNNING
      await this.manager.save(task)
      this.emitter.emit(taskId, task)

      const result = await handle.call('runAction', {
        pluginId,
        actionId,
        taskId,
        jobId,
        initiator,
        params
      })
      job.return = result
      job.state = JobState.SUCCESS
    } catch (err) {
      job.return = err instanceof Error ? err.message : err
      job.state = JobState.FAILED
      toThrow = err
    }
    worker.exit()
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
