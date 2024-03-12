import { computed, defineComponent,inject } from "vue";
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
        // 通过key 拿到对应的组件
        const component = config.componentMap[props.block.key]
        return () => (
            <div style={blockStyle.value} class="editor-block">{component.render()}</div>
        )
    }
})