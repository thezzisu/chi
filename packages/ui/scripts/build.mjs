import { $, argv } from 'zx'

if (process.platform === 'win32') {
  $.shell = 'cmd.exe'
  $.prefix = ''
}

await $`yarn build`
if (argv.ci) {
  await $`yarn build -m electron`
}
