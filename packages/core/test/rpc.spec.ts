/* eslint-disable @typescript-eslint/ban-ts-comment */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { createLogger } from '../src/logger/index.js'
import { RpcRouter, RpcEndpoint, RpcTypeDescriptor } from '../src/rpc/index.js'

chai.use(chaiAsPromised)
const expect = chai.expect

const logger = createLogger('core', 'test')

interface ITestFns {
  foo(bar: string): number
  bad(): void
}

function setupRpc() {
  const router = new RpcRouter()
  const adapter1 = router.createAdapter('1', (msg) => {
    endpoint1.recv(msg)
  })
  const endpoint1 = new RpcEndpoint<RpcTypeDescriptor<ITestFns, {}>>(
    '1',
    (msg) => adapter1.recv(msg),
    logger
  )
  endpoint1.provide('foo', (bar) => +bar)
  endpoint1.provide('bad', () => {
    throw new Error('BAD!!')
  })
  const adapter2 = router.createAdapter('2', (msg) => {
    endpoint2.recv(msg)
  })
  const endpoint2 = new RpcEndpoint<RpcTypeDescriptor<{}, {}>>(
    '2',
    (msg) => adapter2.recv(msg),
    logger
  )
  const handle = endpoint2.getHandle<RpcTypeDescriptor<ITestFns, {}>>('1')
  return handle
}

describe('RPC', () => {
  it('call ok', async () => {
    const handle = setupRpc()
    await expect(handle.call('foo', '123')).eventually.eq(123)
  })

  it('call remote error', async () => {
    const handle = setupRpc()
    await expect(handle.call('bad')).rejectedWith('BAD!!')
  })

  it('call not found', async () => {
    const handle = setupRpc()
    // @ts-ignore
    await expect(handle.call('not-found')).rejectedWith('No implementation')
  })
})
