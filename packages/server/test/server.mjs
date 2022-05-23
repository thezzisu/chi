import { ChiApp } from '@chijs/server'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const app = new ChiApp({
  plugins: ['@/plugin.ts'],
  services: [
    {
      name: 'test2',
      plugin: '@/plugin.ts',
      params: {
        foo: 'bar',
        wait: ''
      },
      autostart: true
    },
    {
      name: 'test',
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
