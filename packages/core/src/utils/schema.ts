import type { Static, TSchema } from './types/index.js'
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

export function validate<S extends TSchema>(
  object: unknown,
  schema: S
): object is Static<S> {
  const ok = ajv.validate(schema, object)
  return ok
}
