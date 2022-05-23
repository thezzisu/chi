import { ChiClient } from '@chijs/client'
import { InjectionKey } from 'vue'

export const clientKey: InjectionKey<ChiClient> = Symbol('client')
