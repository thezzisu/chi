import { fileURLToPath } from 'url'
import { ChiApp } from './app.js'

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = new ChiApp()
  app.start()
}
