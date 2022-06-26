import { monaco } from 'src/shared/monaco'
import { defineComponent, h, onMounted, ref } from 'vue'

export default defineComponent({
  props: {
    value: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text/plain'
    },
    theme: {
      type: String,
      default: 'vs'
    }
  },
  setup(props) {
    const el = ref<HTMLPreElement | null>(null)
    onMounted(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      monaco.editor.colorizeElement(el.value!, {
        theme: props.theme,
        mimeType: props.type
      })
    })
    return () => h('pre', { ref: el }, props.value)
  }
})
