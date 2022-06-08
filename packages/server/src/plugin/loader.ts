import {
  decodeReject,
  encodeReject,
  IPluginInfo,
  IRejection
} from '@chijs/core'
import { fork } from 'node:child_process'
import { dirname, isAbsolute, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import fs from 'fs-extra'
import { resolveModule } from '../util/index.js'

const filepath = fileURLToPath(import.meta.url)

interface ILoaderErrorMsg {
  type: 'error'
  reject: IRejection
}

interface ILoaderSuccessMsg {
  type: 'success'
  data: IPluginInfo
}

export function loadPlugin(resolved: string) {
  return new Promise<IPluginInfo>((resolve, reject) => {
    const worker = fork(filepath, [], {
      env: {
        ...process.env,
        CHI_LOADER_RESOLVED: resolved
      }
    })
    worker.on('message', (msg: ILoaderErrorMsg | ILoaderSuccessMsg) => {
      if (msg.type === 'error') {
        reject(decodeReject(msg.reject))
      } else {
        resolve(msg.data)
      }
    })
    worker.on('exit', (code, signal) => {
      reject(
        new Error(
          `Worker exited with ` + (signal ? `signal ${signal}` : `code ${code}`)
        )
      )
    })
  })
}

const fieldMapping = {
  name: 'name',
  description: 'desc',
  version: 'version',
  license: 'license',
  author: 'author',
  homepage: 'homepage',
  repository: 'repository',
  bugs: 'bugs'
}

function loadPackageInfo(module: string) {
  try {
    const path = resolveModule(module + '/package.json')
    const info = fs.readJSONSync(path)
    const result: Record<string, unknown> = {}
    const readme = join(dirname(path), 'README.md')
    for (const [K1, K2] of Object.entries(fieldMapping)) {
      if (K1 in info) result[K2] = info[K1]
    }
    if (fs.pathExistsSync(readme)) {
      result.desc = fs.readFileSync(readme, 'utf8')
    }
    Object.assign(result, info.chi ?? {})
    return result
  } catch {
    return {}
  }
}

if (process.argv[1] === filepath) {
  try {
    let resolved = process.env.CHI_LOADER_RESOLVED
    if (!resolved) throw new Error('CHI_LOADER_RESOLVED is not defined')
    let info: Record<string, unknown> = {}
    if (isAbsolute(resolved)) {
      resolved = pathToFileURL(resolved).href
    } else {
      info = loadPackageInfo(resolved)
    }
    const {
      default: { main: _main, ...data }
    } = await import(resolved)
    process.send?.({ type: 'success', data: { ...info, ...data } })
  } catch (e) {
    process.send?.({ type: 'error', reject: encodeReject(e) })
  }
}
