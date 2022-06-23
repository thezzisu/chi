import type { TSchema } from '@sinclair/typebox'
import addFormats from 'ajv-formats'
import Ajv from 'ajv/dist/2019.js'

const ajv = addFormats(new Ajv({}), [
  'date-time',
  'time',
  'date',
  'email',
  'hostname',
  'ipv4',
  'ipv6',
  'uri',
  'uri-reference',
  'uuid',
  'uri-template',
  'json-pointer',
  'relative-json-pointer',
  'regex'
])
  .addKeyword('kind')
  .addKeyword('modifier')

export function validateSchema<S extends TSchema>(object: unknown, schema: S) {
  const validate = ajv.compile(schema)
  const ok = validate(object)
  return ok ? [] : validate.errors ?? []
}

export * from '@sinclair/typebox'
