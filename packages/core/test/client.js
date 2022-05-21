import { ChiClient } from '../lib/client/index.js'

const client = new ChiClient('ws://localhost:3000')

const version = await client.call('app:version', [])

console.log(`Server version: ${version}`)

await client.call('app:plugin:load', ['./test/plugin.js'])
console.log('Plugin loaded')
await client.call('app:service:add', [
  './test/plugin.js',
  'test',
  { foo: 'foobar' }
])

let services = await client.call('app:service:list', [])
console.table(services)

await client.call('app:service:start', ['test'])
console.log('Service started')

services = await client.call('app:service:list', [])
console.table(services)
