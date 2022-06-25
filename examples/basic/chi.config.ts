import { defineConfig } from '@chijs/app'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [
    {
      id: '~/foo.ts',
      params: {}
    }
  ],
  resolve: {
    '~': resolve(dirname(fileURLToPath(import.meta.url)), 'plugins')
  },
  web: {
    port: 3000,
    token: 'example-token'
  },
  log: {
    path: 'logs',
    level: 'info'
  }
})
