import { ChiClient } from '../lib/client/index.js'

const client = new ChiClient('ws://localhost:3000')

console.log(await client.call('app:version', []))

const ab = await client.call('app:util:readFile', ['./package.json'])
const buffer = Buffer.from(ab)
console.log(buffer.toString())
