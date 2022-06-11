import 'reflect-metadata'
import pino from 'pino'
import pretty from 'pino-pretty'
import fs from 'fs-extra'
import { dirname, join } from 'node:path'
import { RPC, ServiceRestartPolicy } from '@chijs/core'
import { ChiAppOptions, defaultConfig, IChiConfig } from './config/index.js'
import { PluginRegistry } from './plugin/index.js'
import { ServiceManager } from './service/index.js'
import { WebServer } from './web/index.js'
import { RpcManager } from './rpc/index.js'
import { Database } from './db/index.js'
import { ActionManager } from './action/index.js'

export class ChiApp {
  config
  logger
  db
  rpc
  web
  plugins
  services
  actions
  logPath

  constructor(options?: ChiAppOptions) {
    this.config = <IChiConfig>Object.assign({}, defaultConfig, options)
    const streams: (pino.DestinationStream | pino.StreamEntry)[] = [
      { level: 'warn', stream: pretty() }
    ]
    this.logPath = this.config.log.path
      ? join(this.config.log.path, `app-${+new Date()}.log`)
      : null
    if (this.logPath) {
      fs.ensureDirSync(dirname(this.logPath))
      streams.push({
        stream: fs.createWriteStream(this.logPath),
        level: this.config.log.level ?? 'info'
      })
    }

    this.logger = pino(
      { name: 'chi', base: undefined, level: 'trace' },
      pino.multistream(streams)
    )

    this.db = new Database(this)
    this.rpc = new RpcManager(this)
    this.web = new WebServer(this)
    this.plugins = new PluginRegistry(this)
    this.services = new ServiceManager(this)
    this.actions = new ActionManager(this)
  }

  async start() {
    this.logger.error(`Starting Chi`)
    await this.db.init()
    await this.web.start()
    this.logger.info(`Loading plugins`)
    for (const plugin of this.config.plugins) {
      try {
        this.logger.info(`Loading plugin ${plugin}`)
        await this.plugins.load(plugin)
      } catch (e) {
        this.logger.error(e)
      }
    }
    this.logger.info(`Loading services`)
    for (const service of this.config.services) {
      try {
        this.logger.info(`Loading service ${service.id}`)
        this.services.add({
          restartPolicy: ServiceRestartPolicy.NEVER,
          ...service
        })
      } catch (e) {
        this.logger.error(e)
      }
    }
    this.logger.info(`Starting services`)
    for (const service of this.config.services.filter((s) => s.autostart)) {
      try {
        this.services.start(service.id, RPC.server())
      } catch (e) {
        this.logger.error(e)
      }
    }
    this.logger.error('Chi started')
  }
}

export * from './config/index.js'
export * from './util/index.js'
