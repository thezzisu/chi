import fetch from 'node-fetch'
import { setTimeout } from 'timers/promises'
import { confirm } from './common.js'

export async function inChina() {
  try {
    const controller = new AbortController()
    setTimeout(1000).then(() => controller.abort())
    const res = await fetch('https://www.google.com', {
      signal: controller.signal
    })
    return !res.ok
  } catch (e) {
    return true
  }
}

export async function useMirror() {
  if (await inChina()) {
    if (
      await confirm(
        'It seems your network connection is poor, do you want to use mirror?'
      )
    ) {
      return true
    }
  }
  return false
}
