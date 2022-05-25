import { ChiApp } from '@chijs/server'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const app = new ChiApp({
  plugins: ['@/plugin.ts'],
  services: [
    {
      id: 'test2',
      plugin: '@/plugin.ts',
      params: {
        foo: 'bar',
        wait: ''
      },
      autostart: true
    },
    {
      id: 'test',
      plugin: '@/plugin.ts',
      params: {
        foo: 'bar',
        wait: 'test2'
      },
      autostart: true
    }
  ],
  resolve: {
    '@': resolve(dirname(fileURLToPath(import.meta.url)))
  },
  logDir: 'stdout'
})
await app.start()
