// @ts-check
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fs, chalk, cd } from 'zx'
import { targetPackages } from './common.mjs'

cd(join(dirname(fileURLToPath(import.meta.url)), '..'))

const packages = await targetPackages()

for (const path of packages) {
  cd(path)
  if (await fs.pathExists('package.json')) {
    const json = fs.readJSONSync('package.json')
    const name = json.name
    console.group(`${name}: ${chalk.green(json.version)}`)
    for (const key of Object.keys(json.dependencies || {})) {
      if (key.startsWith('@chijs')) {
        console.log(
          `${chalk.gray(key)}: ${chalk.green(json.dependencies[key])}`
        )
      }
    }
    console.groupEnd()
  }
}
