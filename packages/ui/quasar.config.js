/* eslint-env node */

const { configure } = require('quasar/wrappers')
const path = require('path')

const CHIUI_VERSION = require('./package.json').version

module.exports = configure(function () {
  return {
    eslint: {
      warnings: true,
      errors: true
    },
    boot: ['i18n'],
    css: ['app.scss'],
    extras: ['mdi-v6', 'roboto-font'],
    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node16'
      },
      vueRouterMode: 'hash',
      vitePlugins: [
        [
          '@intlify/vite-plugin-vue-i18n',
          { include: path.resolve(__dirname, './src/i18n/**') }
        ]
      ],
      env: {
        CHIUI_VERSION
      }
    },
    devServer: {
      open: true
    },
    framework: {
      config: {},
      iconSet: 'mdi-v6',
      plugins: ['Notify']
    },
    animations: 'all',
    electron: {
      inspectPort: 5858,
      bundler: 'builder',
      builder: {
        appId: 'ui'
      }
    }
  }
})
