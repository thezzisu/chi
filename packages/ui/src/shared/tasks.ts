import type { IJobInfo } from '@chijs/app'
import { Node } from './treeview'

function generateTreeGrid(
  current: IJobInfo,
  map: Map<string, IJobInfo[]>,
  node: Node
) {
  const children = map.get(current.id)
  if (children) {
    const elems: Node[] = []
    children.forEach((value) => {
      const childNode: Node = { value }
      elems.push(childNode)
      generateTreeGrid(value, map, childNode)
    })
    node.children = elems
  }
}

export function createJobTree(jobs: IJobInfo[]): Node {
  const map = new Map<string, IJobInfo[]>()
  let root: IJobInfo | null = null
  for (const job of jobs) {
    if (!job.parent) {
      root = job
    } else {
      if (!map.has(job.parent)) map.set(job.parent, [])
      map.get(job.parent)?.push(job)
    }
  }
  if (!root) throw new Error('No root job')
  const node: Node = {
    value: root
  }
  generateTreeGrid(root, map, node)
  return node
}

export function icon(job: IJobInfo): string {
  switch (job.state) {
    case 'initializing':
      return 'mdi-timer-sand-empty'
    case 'running':
      return 'mdi-play'
    case 'success':
      return 'mdi-check'
    case 'failed':
      return 'mdi-error'
  }
}

export function color(job: IJobInfo): string {
  switch (job.state) {
    case 'initializing':
      return 'primary'
    case 'running':
      return 'warning'
    case 'success':
      return 'positive'
    case 'failed':
      return 'negative'
  }
}
