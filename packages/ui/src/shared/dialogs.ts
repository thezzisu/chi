import { Dialog } from 'quasar'

export function confirm(message = 'Press OK to continue', title = 'Confirm') {
  return new Promise<void>((resolve, reject) => {
    Dialog.create({
      title,
      message,
      cancel: true,
      persistent: true
    })
      .onOk(() => resolve())
      .onCancel(() => reject(new Error('User canceled')))
  })
}
