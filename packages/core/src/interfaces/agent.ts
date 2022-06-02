import { RpcTypeDescriptor } from '../rpc/index.js'

export interface AgentInteractOptions {
  /** Interact id for autocompletion */
  id?: string
}

export interface AgentNotifyOptions extends AgentInteractOptions {
  /** Optional type (that has been previously registered) or one of the out of the box ones ('positive', 'negative', 'warning', 'info', 'ongoing') */
  type?: string
  /** Color name for component from the Quasar Color Palette */
  color?: string
  /** Color name for component from the Quasar Color Palette */
  textColor?: string
  /** The content of your message */
  message?: string
  /** The content of your optional caption */
  caption?: string
  /** Render the message as HTML; This can lead to XSS attacks, so make sure that you sanitize the message first */
  html?: boolean
  /** Icon name following Quasar convention; Make sure you have the icon library installed unless you are using 'img:' prefix; If 'none' (String) is used as value then no icon is rendered (but screen real estate will still be used for it) */
  icon?: string
  /** Color name for component from the Quasar Color Palette */
  iconColor?: string
  /** Size in CSS units, including unit name */
  iconSize?: string
  /** URL to an avatar/image; Suggestion: use public folder */
  avatar?: string
  /**
   * Window side/corner to stick to
   * Default value: bottom
   */
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center'
  /**
   * Override the auto generated group with custom one; Grouped notifications cannot be updated; String or number value inform this is part of a specific group, regardless of its options; When a new notification is triggered with same group name, it replaces the old one and shows a badge with how many times the notification was triggered
   * Default value: (message + caption + multiline + actions labels + position)
   */
  group?: boolean | string | number
  /** Color name for the badge from the Quasar Color Palette */
  badgeColor?: string
  /** Color name for the badge text from the Quasar Color Palette */
  badgeTextColor?: string
  /**
   * Notification corner to stick badge to; If notification is on the left side then default is top-right otherwise it is top-left
   * Default value: (top-left/top-right)
   */
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** Show progress bar to detail when notification will disappear automatically (unless timeout is 0) */
  progress?: boolean
  /**
   * Amount of time to display (in milliseconds)
   * Default value: 5000
   */
  timeout?: number
}

export interface AgentAlertOptions extends AgentInteractOptions {
  message?: string
  caption?: string
}

export interface AgentConfirmOptions extends AgentInteractOptions {
  message?: string
  caption?: string
}

export interface AgentPromptOptions extends AgentInteractOptions {
  message?: string
  caption?: string
  label?: string
  placeholder?: string
}

export type AgentDescriptor = RpcTypeDescriptor<
  {
    ['$a:notify'](options: AgentNotifyOptions | string): void
    ['$a:alert'](options: AgentAlertOptions | string): void
    ['$a:confirm'](options: AgentConfirmOptions | string): boolean
    ['$a:prompt'](options: AgentPromptOptions | string): string
  },
  {}
>
