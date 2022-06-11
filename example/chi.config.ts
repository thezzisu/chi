import { ServiceRestartPolicy } from '@chijs/core'
import { defineConfig } from '@chijs/server'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: ['@/plugins/foo.ts', '@/plugins/action.ts'],
  services: [
    {
      id: 'test2',
      name: 'Some name',
      desc: 'Some description',
      pluginId: '@/plugins/foo.ts',
      params: {
        foo: 'bar',
        wait: ''
      },
      autostart: true
    },
    {
      id: 'test',
      pluginId: '@/plugins/foo.ts',
      params: {
        foo: 'bar',
        wait: 'test2'
      },
      autostart: true
    },
    {
      id: 'action',
      pluginId: '@/plugins/action.ts',
      params: {
        hello: 'Hello!'
      },
      autostart: true,
      restartPolicy: ServiceRestartPolicy.ON_FAILURE
    }
  ],
  resolve: {
    '@': resolve(dirname(fileURLToPath(import.meta.url)))
  },
  web: {
    port: -1,
    token: 'example-token'
  },
  log: {
    path: 'logs',
    level: 'info'
  }
})
