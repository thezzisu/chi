export interface IAgentApis {
  ['notify'](title: string, content: string): void
  ['input'](title: string, label: string): string
  ['confirm'](title: string, label: string): boolean
}
