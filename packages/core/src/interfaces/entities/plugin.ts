import { TSchema } from '../../utils/index.js'

export interface IPluginContext {
  test(): void
}

export interface IPluginDefn {
  params: Record<string, TSchema>
  main(ctx: IPluginContext, params: Record<string, unknown>): unknown
}

export interface IPluginInfo extends Omit<IPluginDefn, 'main'> {
  name: string
}
