export interface IServiceDefn {
  name: string
  plugin: string
  params: Record<string, unknown>
}

export interface IServiceInfo extends IServiceDefn {
  running: boolean
}
