import { resolve } from 'node:path'
import { resolvePath } from '../src/util/index.js'
import { expect } from 'chai'

describe('import resolve', () => {
  const resolveMap = {
    '@': 'prefix'
  }
  it(`should resolve packages`, () => {
    expect(resolvePath('some-package', resolveMap)).to.be.eq('some-package')
    expect(resolvePath('some-package/file', resolveMap)).to.be.eq(
      'some-package/file'
    )
    expect(resolvePath('@some/package', resolveMap)).to.be.eq('@some/package')
    expect(resolvePath('@some/package/file', resolveMap)).to.be.eq(
      '@some/package/file'
    )
  })
  it(`should resolve paths`, () => {
    const resolved = resolve('./some.js')
    expect(resolvePath('./some.js', resolveMap)).to.be.eq(resolved)
    expect(resolvePath(resolved, resolveMap)).to.be.eq(resolved)
  })
  it(`should resolve mappings`, () => {
    expect(resolvePath('@/some.js', resolveMap)).to.be.eq(
      resolve('prefix/some.js')
    )
  })
})
