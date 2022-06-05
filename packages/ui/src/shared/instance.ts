import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

export interface IRemoteInstance {
  id: string
  name: string
  type: 'remote'
  url: string
  token: string
}

export type Instance = IRemoteInstance

export const instanceMap = useLocalStorage<Record<string, Instance>>(
  'connections',
  {},
  { deep: true }
)

export const instances = computed(() => Object.values(instanceMap.value))

export function getInstance(id: string) {
  return computed(() => instanceMap.value[id])
}
