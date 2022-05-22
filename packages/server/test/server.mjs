import { ChiApp } from '@chijs/server'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const app = new ChiApp({
  plugins: ['@/plugin.mjs'],
  services: [
    {
      name: 'test',
      plugin: '@/plugin.mjs',
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
