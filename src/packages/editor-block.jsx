import { computed, defineComponent,inject, onMounted, ref, watch } from "vue";
// 画布区域 每个单独的组件
export default defineComponent({
    props: {
        block: {type: Object}
    },
    setup(props) {
        const config = inject('config')
        const blockStyle = computed(() => {
            return {
                top: props.block.top + 'px',
                left: props.block.left + 'px',
                zIndex: props.block.zIndex
            }
        })
        const blockRef = ref(null)
        onMounted(() => {
            let { offsetWidth,offsetHeight } = blockRef.value
            if(props.block.alignCenter) { // 说明拖拽松手的时候才渲染，其他的默认渲染到页面上
                props.block.left = props.block.left - offsetWidth / 2
                props.block.top = props.block.top - offsetHeight / 2
                props.block.alignCenter = false // 让渲染后的结果才能去居中
            }
            props.block.width = offsetWidth
            props.block.height = offsetHeight
        })
        return () => {
            const component = config.componentMap[props.block.key]
            return <div style={blockStyle.value} class="editor-block" ref={blockRef}>{component.render()}</div>
        }
    }
})