import { JobState } from '@chijs/core'
import { DataSource } from 'typeorm'
import { ChiApp } from '../index.js'
import { ActionTask } from './task.js'

export class Database {
  ds

  constructor(private app: ChiApp) {
    this.ds = new DataSource(<never>{
      ...app.config.db,
      entities: [ActionTask]
    })
  }

  async init() {
    await this.ds.initialize()
    const badTasks = await this.ds.manager.find(ActionTask, {
      where: { state: JobState.RUNNING }
    })
    this.app.logger.info(`Cleanup ${badTasks.length} tasks`)
    for (const task of badTasks) {
      for (const job of task.jobs) {
        if (job.state === JobState.RUNNING) {
          job.state = JobState.FAILED
          job.finished = job.created
          job.return = 'Failed due to server shutdown'
        }
      }
      task.state = JobState.FAILED
      task.finished = task.created
      await this.ds.manager.save(task)
    }
  }
}
