// @ts-check
import { ServiceRestartPolicy } from '@chijs/core'
import { ChiApp } from '@chijs/server'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const app = new ChiApp({
  plugins: ['@/plugin.ts'],
  services: [
    {
      id: 'test2',
      name: 'Some name',
      desc: 'Some description',
      plugin: '@/plugin.ts',
      params: {
        foo: 'bar',
        wait: ''
      },
      autostart: true,
      restartPolicy: ServiceRestartPolicy.NEVER
    },
    {
      id: 'test',
      plugin: '@/plugin.ts',
      params: {
        foo: 'bar',
        wait: 'test2'
      },
      autostart: true,
      restartPolicy: ServiceRestartPolicy.NEVER
    }
  ],
  resolve: {
    '@': resolve(dirname(fileURLToPath(import.meta.url)))
  },
  logDir: 'stdout'
})
await app.start()
