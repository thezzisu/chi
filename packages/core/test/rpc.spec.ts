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

interface ITestPubs {
  interval(int: number): number
}

type Desc = RpcTypeDescriptor<ITestFns, ITestPubs>

async function setupRpc() {
  const router = new RpcRouter()
  const adapter1 = router.createAdapter('1', (msg) => {
    endpoint1.recv(msg)
  })
  const endpoint1 = new RpcEndpoint<Desc>(
    '1',
    (msg) => adapter1.recv(msg),
    logger
  )
  endpoint1.provide('foo', (bar) => +bar)
  endpoint1.provide('bad', () => {
    throw new Error('BAD!!')
  })
  endpoint1.publish('interval', (cb, int) => {
    const id = setInterval(() => cb(Date.now()), int)
    return () => clearInterval(id)
  })
  const adapter2 = router.createAdapter('2', (msg) => {
    endpoint2.recv(msg)
  })
  const endpoint2 = new RpcEndpoint<RpcTypeDescriptor<{}, {}>>(
    '2',
    (msg) => adapter2.recv(msg),
    logger
  )
  const handle = endpoint2.getHandle<Desc>('1')
  await handle.connect()
  return { router, adapter1, endpoint1, adapter2, endpoint2, handle }
}

describe('RPC', () => {
  it('call ok', async () => {
    const { handle } = await setupRpc()
    await expect(handle.call('foo', '123')).eventually.eq(123)
  })

  it('call remote error', async () => {
    const { handle } = await setupRpc()
    await expect(handle.call('bad')).rejectedWith('BAD!!')
  })

  it('call not found', async () => {
    const { handle } = await setupRpc()
    // @ts-ignore
    await expect(handle.call('not-found')).rejectedWith('No implementation')
  })

  it('handle disposed', async () => {
    const { adapter1, handle } = await setupRpc()
    adapter1.dispose(new Error('Manually closed'))
    await expect(handle.call('foo', '123')).rejectedWith('disposed')
  })

  it('handle remote close', async () => {
    const { adapter1, handle } = await setupRpc()
    const promise = handle.call('foo', '123')
    adapter1.dispose(new Error('Manually closed'))
    await expect(promise).rejectedWith('Manually closed')
  })

  it('publish ok', async () => {
    const { handle } = await setupRpc()
    const results = []
    const id = await handle.subscribe(
      'interval',
      (data) => {
        results.push(data)
      },
      10
    )
    await new Promise((resolve) => setTimeout(resolve, 20))
    await handle.unsubscribe(id)
    const len = results.length
    expect(len).gt(0)
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(results.length).eq(len)
  })

  it('publish remote close', async () => {
    const { endpoint1, adapter1, handle } = await setupRpc()
    const results = []
    let error
    await handle.subscribe(
      'interval',
      (data, err) => {
        if (err) {
          error = err
          return
        }
        results.push(data)
      },
      10
    )
    adapter1.dispose(new Error('Manually closed'))
    expect(error.message).eq('Manually closed')
    endpoint1.dispose(new Error('Manually closed'))
  })
})
