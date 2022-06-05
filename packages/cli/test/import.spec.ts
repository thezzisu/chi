import { dirname, join } from 'node:path'
import { expect } from 'chai'
import { unifiedImport } from '../src/import.js'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('unified import', () => {
  const exts = ['json', 'json5', 'js', 'mjs', 'cjs', 'ts', 'mts', 'cts']
  for (const ext of exts) {
    it(`should import ${ext}`, async () => {
      const imported = await unifiedImport(
        join(__dirname, 'fixtures', 'config.' + ext),
        true
      )
      expect(imported.default).to.be.deep.eq({ foo: 'bar' })
    })
  }
})
