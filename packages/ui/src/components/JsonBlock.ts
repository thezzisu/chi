import { Component, h } from 'vue'
import MonacoBlock from './MonacoBlock'

type MonacoBlockProps = InstanceType<typeof MonacoBlock>['$props']

const component: Component<
  Omit<MonacoBlockProps, 'value' | 'type'> & { data: unknown }
> = (props) => {
  const { data, ...rest } = props
  return h(MonacoBlock, {
    ...rest,
    value: JSON.stringify(data, null, 2),
    type: 'text/javascript'
  })
}

export default component
