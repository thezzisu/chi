import { ChiApp } from '@chijs/server'

const app = new ChiApp({
  plugins: ['./plugin.mjs'],
  services: [
    {
      name: 'test',
      plugin: './plugin.mjs',
      params: {
        foo: 'bar'
      },
      autostart: true
    }
  ]
})
await app.start()
