import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const data = join(root, 'data')

const content = (file: string) => readFileSync(join(data, file), 'utf8')
export const tsconfig = () => content('tsconfig.json')
export const configYml = () => content('chi.config.yml')
export const configTs = () => content('chi.config.ts')
export const configJs = () => content('chi.config.js')
export const configJson = () => content('chi.config.json')
export const packageJson = () => content('package.json')
