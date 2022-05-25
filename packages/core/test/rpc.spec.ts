/* eslint-disable @typescript-eslint/ban-ts-comment */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { RpcClient, RpcServer } from '../src/rpc/index.js'

chai.use(chaiAsPromised)
const expect = chai.expect

interface ITestFns {
  foo(bar: string): number
  bad(): void
}

function setupRpc() {
  const client: RpcClient<ITestFns> = new RpcClient<ITestFns>((msg) => {
    server.handle(msg)
  })
  const server: RpcServer<ITestFns> = new RpcServer<ITestFns>((msg) => {
    client.handle(msg)
  })
  server.implement('foo', (bar) => +bar)
  server.implement('bad', () => {
    throw new Error('BAD!!')
  })
  return { client, server }
}

describe('RPC', () => {
  it('call ok', async () => {
    const { client } = setupRpc()
    await expect(client.call('foo', '123')).eventually.eq(123)
  })

  it('call remote error', async () => {
    const { client } = setupRpc()
    await expect(client.call('bad')).rejectedWith('BAD!!')
  })

  it('call not found', async () => {
    const { client } = setupRpc()
    // @ts-ignore
    await expect(client.call('not-found')).rejectedWith('not implemented')
  })
})
