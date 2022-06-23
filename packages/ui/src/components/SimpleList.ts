import {
  QList,
  QListProps,
  QItem,
  QItemProps,
  QItemSection,
  QIcon,
  QItemLabel
} from 'quasar'
import { Component, h } from 'vue'
import { RouterLink } from 'vue-router'

export interface ISimpleListItem {
  icon?: string
  caption?: string
  label?: string
  labelTo?: string
  hide?: boolean
  props?: QItemProps
}

const component: Component<{
  listProps?: QListProps
  items: ISimpleListItem[]
}> = (props) => {
  return h(QList, props.listProps, () =>
    props.items
      .filter((item) => !item.hide)
      .map((item) =>
        h(QItem, item.props, () => {
          const sections: Parameters<typeof h>[2] = []
          if (item.icon) {
            sections.push(
              h(QItemSection, { avatar: true }, () =>
                h(QIcon, { name: item.icon })
              )
            )
          }
          if (item.caption || item.label) {
            sections.push(
              h(QItemSection, undefined, () => {
                const childs: Parameters<typeof h>[2] = []
                if (item.caption) {
                  childs.push(
                    h(QItemLabel, { caption: true }, () => item.caption)
                  )
                }
                if (item.label) {
                  childs.push(
                    h(QItemLabel, undefined, () =>
                      item.labelTo
                        ? h(RouterLink, { to: item.labelTo }, () => item.label)
                        : item.label
                    )
                  )
                }
                return childs
              })
            )
          }
          return sections
        })
      )
  )
}

export default component
