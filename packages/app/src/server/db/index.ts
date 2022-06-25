import { createLogger } from '@chijs/util'
import { DataSource } from 'typeorm'
import { ChiServer } from '../index.js'
import { ActionTask } from './task.js'

export class Database {
  ds
  private logger

  constructor(private app: ChiServer) {
    this.ds = new DataSource(<never>{
      ...app.config.db,
      entities: [ActionTask]
    })
    this.logger = createLogger(['db'], {}, app.logger)
  }

  async init() {
    await this.ds.initialize()
    const badTasks = await this.ds.manager.find(ActionTask, {
      where: { state: 'running' }
    })
    this.logger.info(`Cleanup ${badTasks.length} tasks`)
    for (const task of badTasks) {
      for (const job of task.jobs) {
        if (job.state === 'running') {
          job.state = 'failed'
          job.finished = job.created
          job.return = 'Failed due to server shutdown'
        }
      }
      task.state = 'failed'
      task.finished = task.created
      await this.ds.manager.save(task)
    }
  }
}

export * from './task.js'
