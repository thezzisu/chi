import { join, normalize, resolve } from 'node:path'
import { expect } from 'chai'
import { TEST_ROOT } from '../shared.js'
import { resolveImport, unifiedImport } from '../../src/utils/import.js'

describe('unified import', () => {
  const exts = ['json', 'json5', 'js', 'mjs', 'cjs', 'ts', 'mts', 'cts']
  for (const ext of exts) {
    it(`should import ${ext}`, async () => {
      const imported = await unifiedImport(
        join(TEST_ROOT, 'fixtures', 'import', 'config.' + ext),
        true
      )
      expect(imported.default).to.be.deep.eq({ foo: 'bar' })
    })
  }
})

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
