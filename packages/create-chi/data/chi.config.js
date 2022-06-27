import { defineConfig } from '@chijs/app'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [],
  resolve: {
    '~': resolve(dirname(fileURLToPath(import.meta.url)), 'plugins')
  },
  web: {
    port: 3030,
    token: '#RANDOM'
  },
  log: {
    path: 'logs',
    level: 'info'
  }
})
