import { $, argv } from 'zx'

await $`yarn build`
if (argv.ci) {
  await $`yarn build -m electron`
}
