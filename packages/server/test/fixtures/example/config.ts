import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

export default {
  plugins: ['~/plugins/foo.js'],
  services: [
    {
      id: 'foo',
      plugin: '~/plugins/foo.js',
      params: {
        foo: 'bar'
      },
      autostart: true
    }
  ],
  resolve: {
    '~': resolve(dirname(fileURLToPath(import.meta.url)))
  }
}
