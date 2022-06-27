import chalk from 'chalk'
import prompts from 'prompts'

export function info(msg: string, ...rest: unknown[]) {
  console.log(`[-] ${msg}`, ...rest)
}

export function err(msg: string, ...rest: unknown[]) {
  console.log(chalk.redBright(`[!] ${msg}`), ...rest)
}

export function warn(msg: string, ...rest: unknown[]) {
  console.log(chalk.yellowBright(`[+] ${msg}`), ...rest)
}

export async function confirm(message: string): Promise<boolean> {
  const res = await prompts({
    type: 'confirm',
    name: 'value',
    message
  })
  return res.value
}

export async function askForString(message: string): Promise<string> {
  const res = await prompts({
    type: 'text',
    name: 'value',
    message
  })
  return res.value
}
