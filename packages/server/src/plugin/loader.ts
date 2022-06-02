import {
  decodeReject,
  encodeReject,
  IPluginInfo,
  IRejection
} from '@chijs/core'
import { fork } from 'child_process'
import { fileURLToPath } from 'url'

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
        CHI_LOADER_RESOLVED: resolved,
        NODE_OPTIONS: process.env.NODE_OPTIONS ?? '--loader ts-node/esm'
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
          `Worker exited with ` + (code ? `code ${code}` : `signal ${signal}`)
        )
      )
    })
  })
}

if (process.argv[1] === filepath) {
  try {
    const resolved = process.env.CHI_LOADER_RESOLVED
    if (!resolved) throw new Error('CHI_LOADER_RESOLVED is not defined')
    const {
      default: { main: _main, ...data }
    } = await import(resolved)
    process.send?.({ type: 'success', data })
  } catch (e) {
    process.send?.({ type: 'error', reject: encodeReject(e) })
  }
}
