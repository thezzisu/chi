import pino from 'pino'

const l1 = pino({ level: 'error' })
l1.info('123')
l1.level = 'info'
l1.info('123')

const l2 = l1.child({})
l2.info('123')
l1.level = 'error'
l2.info('123')
