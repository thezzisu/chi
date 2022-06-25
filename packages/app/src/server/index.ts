import { createBaseLogger } from '@chijs/util'
import fs from 'fs-extra'
import { dirname, join } from 'node:path'
import pino from 'pino'
import 'reflect-metadata'
import { ActionManager } from './action/index.js'
import { ChiAppOptions, defaultConfig, IChiConfig } from './config/index.js'
import { Database } from './db/index.js'
import { PluginManager } from './plugin/index.js'
import { RpcManager } from './rpc/index.js'
import { ServiceManager } from './service/index.js'
import { WebServer } from './web/index.js'
import { WorkerManager } from './worker/index.js'

export class ChiServer {
  config
  logger
  db
  rpc
  web
  workers
  plugins
  services
  actions

  constructor(options?: ChiAppOptions) {
    this.config = <IChiConfig>Object.assign({}, defaultConfig, options)
    const level = this.config.log.level ?? 'info'
    const streams: (pino.DestinationStream | pino.StreamEntry)[] = [
      { level, stream: process.stdout }
    ]
    const logPath =
      this.config.log.path &&
      join(this.config.log.path, 'app', `${+new Date()}.log`)
    if (logPath) {
      fs.ensureDirSync(dirname(logPath))
      streams.push({
        stream: fs.createWriteStream(logPath),
        level
      })
    }

    this.logger = createBaseLogger(
      { name: 'chi', base: undefined, level: 'trace' },
      pino.multistream(streams)
    )

    this.db = new Database(this)
    this.rpc = new RpcManager(this)
    this.web = new WebServer(this)
    this.workers = new WorkerManager(this)
    this.plugins = new PluginManager(this)
    this.services = new ServiceManager(this)
    this.actions = new ActionManager(this)
  }

  async start() {
    this.logger.error(`Starting Chi`)
    await this.db.init()
    this.logger.info(`Loading plugins`)
    for (const plugin of this.config.plugins) {
      try {
        this.logger.info(`Loading plugin ${plugin.id}`)
        await this.plugins.load(plugin.id, plugin.params)
      } catch (e) {
        this.logger.error(e)
      }
    }
    await this.web.start()
  }
}

export * from './action/index.js'
export * from './config/index.js'
export * from './db/index.js'
export * from './plugin/index.js'
export * from './rpc/index.js'
export * from './service/index.js'
