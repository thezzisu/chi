import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

export type EnvironmentType = 'remote' | 'local'

export interface IGlobalOptions {
  node?: string
}

export interface IBaseEnvironment {
  id: string
  name: string
  desc: string
  type: EnvironmentType
}

export interface ILocalEnvironment extends IBaseEnvironment {
  type: 'local'
  config: string
}

export interface IRemoteEnvironment extends IBaseEnvironment {
  type: 'remote'
  url: string
  token: string
}

export type Environment = IRemoteEnvironment | ILocalEnvironment

export const environmentMap = useLocalStorage<Record<string, Environment>>(
  'connections',
  {},
  { deep: true }
)

export const environments = computed(() => Object.values(environmentMap.value))

export function getEnvironment(id: string) {
  return computed(() => environmentMap.value[id])
}

export const environmentTypes: { label: string; value: EnvironmentType }[] = [
  { label: 'Remote', value: 'remote' }
]
if (process.env.MODE === 'electron') {
  environmentTypes.push({ label: 'Local', value: 'local' })
}

export async function selectConfig() {
  const result = await window.bridge?.showOpenDialog({
    properties: ['openFile']
  })
  return result?.filePaths[0]
}
