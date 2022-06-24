import { QBreadcrumbs, QBreadcrumbsEl, QIcon } from 'quasar'
import { Component, h } from 'vue'

const component: Component<{ labels: string[] }> = (props) => {
  return h(QBreadcrumbs, null, {
    separator: () =>
      h(QIcon, { size: '1.5em', name: 'mdi-chevron-right', color: 'primary' }),
    default: () => props.labels.map((label) => h(QBreadcrumbsEl, { label }))
  })
}

export default component
