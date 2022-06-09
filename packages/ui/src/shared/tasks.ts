import { IJobInfo, JobState } from '@chijs/core'
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
  for (const job of jobs) {
    if (!map.has(job.parent)) map.set(job.parent, [])
    map.get(job.parent)?.push(job)
  }
  const root = (map.get('') ?? [])[0]
  const node: Node = {
    value: root
  }
  generateTreeGrid(root, map, node)
  return node
}

export function icon(job: IJobInfo): string {
  switch (job.state) {
    case JobState.RUNNING:
      return 'mdi-play'
    case JobState.SUCCESS:
      return 'mdi-check'
    case JobState.FAILED:
      return 'mdi-error'
  }
}

export function color(job: IJobInfo): string {
  switch (job.state) {
    case JobState.RUNNING:
      return 'warning'
    case JobState.SUCCESS:
      return 'positive'
    case JobState.FAILED:
      return 'negative'
  }
}
