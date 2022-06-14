import { SpreadTwo } from './type/index.js'

export function withOverride<S extends object, T extends object>(
  obj: S,
  override: T
): SpreadTwo<S, T> {
  const mixed = Object.assign({}, override)
  Object.setPrototypeOf(mixed, obj)
  return <never>mixed
}
