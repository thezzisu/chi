import { normalize, resolve } from 'node:path'
import { resolveImport } from '../src/util/index.js'
import { expect } from 'chai'

describe('import resolve', () => {
  const resolveMap = {
    '@': 'prefix'
  }
  it(`should resolve packages`, () => {
    expect(resolveImport('some-package', resolveMap)).to.be.eq('some-package')
    expect(resolveImport('some-package/file', resolveMap)).to.be.eq(
      normalize('some-package/file')
    )
    expect(resolveImport('@some/package', resolveMap)).to.be.eq(
      normalize('@some/package')
    )
    expect(resolveImport('@some/package/file', resolveMap)).to.be.eq(
      normalize('@some/package/file')
    )
  })
  it(`should resolve paths`, () => {
    expect(resolveImport('./some.js', resolveMap)).to.be.eq(
      normalize('./some.js')
    )
    const resolved = resolve('./some.js')
    expect(resolveImport(resolved, resolveMap)).to.be.eq(resolved)
  })
  it(`should resolve mappings`, () => {
    expect(resolveImport('@/some.js', resolveMap)).to.be.eq(
      normalize('prefix/some.js')
    )
  })
})
