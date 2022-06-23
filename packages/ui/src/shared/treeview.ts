import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

export type Point = [x: number, y: number]
export function domRect(el: Element) {
  return el.getBoundingClientRect()
}
export function domRectToBase(box: DOMRect): Point {
  return [box.left, box.top]
}
export function elemBase(el: Element): Point {
  return domRectToBase(domRect(el))
}
export function elemCenter(el: Element): Point {
  const box = domRect(el)
  return [box.left + box.width / 2, box.top + box.height / 2]
}
export function absToRel(base: Point, offset: Point): Point {
  return [offset[0] - base[0], offset[1] - base[1]]
}

export interface Node {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  children?: Node[]
}

export function useTreeViewLines() {
  const el = ref<HTMLDivElement | null>(null)
  const svg = ref<HTMLElement | null>(null)
  const root = ref<HTMLDivElement | null>(null)
  const sep = ref<HTMLDivElement | null>(null)
  const children = ref<{ root: HTMLDivElement }[] | null>(null)
  const lines = ref<number[][]>([])
  const render = () => {
    if (!svg.value || !children.value || !sep.value || !root.value) {
      lines.value = []
      return
    }
    const base = elemBase(svg.value)
    const elems = children.value.map((child) => child.root)
    if (!elems.length) {
      lines.value = []
      return
    }
    const c = absToRel(base, elemCenter(sep.value))
    const t = [c[0], absToRel(base, elemCenter(elems[0]))[1]]
    const b = [c[0], absToRel(base, elemCenter(elems[elems.length - 1]))[1]]
    lines.value = [[...t, ...b]]
    for (const elem of elems) {
      const e = absToRel(base, elemCenter(elem))
      const start = [c[0], e[1]]
      lines.value.push([...start, ...e])
    }
    const e = absToRel(base, elemCenter(root.value))
    const start = [c[0], e[1]]
    lines.value.push([...start, ...e])
  }
  const observer = new ResizeObserver(() => nextTick(render))
  onMounted(() => {
    el.value && observer.observe(el.value)
  })
  onBeforeUnmount(() => {
    observer.disconnect()
  })
  return { el, svg, root, sep, children, lines, render }
}
