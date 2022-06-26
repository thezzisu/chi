import { monaco } from 'src/shared/monaco'
import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'txt'
    },
    theme: {
      type: String,
      default: 'vs'
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'editorDidMount'],
  setup(props, ctx) {
    const el = ref<HTMLDivElement | null>(null)
    let editor: monaco.editor.IStandaloneCodeEditor | null = null

    watch(
      () => props.modelValue,
      (val) => {
        editor?.setValue(val)
      }
    )

    watch(
      () => props.language,
      (lang) => {
        const model = editor?.getModel()
        model && monaco.editor.setModelLanguage(model, lang)
      }
    )

    watch(
      () => props.theme,
      (theme) => {
        monaco.editor.setTheme(theme)
      }
    )

    watch(
      () => props.readonly,
      (readOnly) => {
        editor?.updateOptions({ readOnly })
      }
    )

    onMounted(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const inst = monaco.editor.create(el.value!, {
        value: props.modelValue,
        language: props.language,
        automaticLayout: true,
        readOnly: props.readonly,
        theme: props.theme
      })
      inst.onDidChangeModelContent(() => {
        ctx.emit('update:modelValue', inst.getValue())
      })
      editor = inst
    })
    onBeforeUnmount(() => {
      editor?.dispose()
    })
    return () => h('div', { class: 'monaco-editor-wrapper', ref: el })
  }
})
