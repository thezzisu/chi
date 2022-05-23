export function easyDeepClone<O>(obj: O): O {
  return JSON.parse(JSON.stringify(obj))
}
