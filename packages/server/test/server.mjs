import { ChiApp } from '@chijs/server'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const app = new ChiApp({
  plugins: ['@/plugin.ts'],
  services: [
    {
      name: 'test',
      plugin: '@/plugin.ts',
      params: {
        foo: 'bar'
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
