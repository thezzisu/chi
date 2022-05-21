import { ChiClient } from '@chijs/client'

const client = new ChiClient('ws://localhost:3000')

const version = await client.call('app:versions', [])
console.log(version)

await client.call('app:plugin:load', ['./plugin.mjs'])
const plugins = await client.call('app:plugin:list', [])
console.table(plugins)

await client.call('app:service:add', ['./plugin.mjs', 'test', { foo: 'bar' }])
const services = await client.call('app:service:list', [])
console.table(services)

await client.call('app:service:start', ['test'])
