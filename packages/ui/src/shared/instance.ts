import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

export type InstanceType = 'remote' | 'local'

export interface IGlobalOptions {
  node?: string
}

export interface IBaseInstance {
  id: string
  name: string
  desc: string
  type: InstanceType
}

export interface ILocalInstance extends IBaseInstance {
  type: 'local'
  config: string
}

export interface IRemoteInstance extends IBaseInstance {
  type: 'remote'
  url: string
  token: string
}

export type Instance = IRemoteInstance | ILocalInstance

export const instanceMap = useLocalStorage<Record<string, Instance>>(
  'connections',
  {},
  { deep: true }
)

export const instances = computed(() => Object.values(instanceMap.value))

export function getInstance(id: string) {
  return computed(() => instanceMap.value[id])
}

export const instanceTypes: { label: string; value: InstanceType }[] = [
  { label: 'Remote', value: 'remote' }
]
if (process.env.MODE === 'electron') {
  instanceTypes.push({ label: 'Local', value: 'local' })
}

export async function selectConfig() {
  const result = await window.bridge?.showOpenDialog({
    properties: ['openFile']
  })
  return result?.filePaths[0]
}
