import { computed, createVNode, defineComponent, onMounted, reactive, render, ref, onBeforeUnmount, provide, inject } from "vue";

export const DropdownItem = defineComponent({
    props: {
        label: String
    },
    setup(props, ctx) {
        let hide = inject('hide')
        const {label} = props
        const {slots} = ctx
        const handleClick = () => {
            ctx.emit('click', props.item)
        }
        return () => <div class="dropdown-item" onClick={hide}>
            <i>{slots.default()}</i>
            <span>{label}</span>
        </div>
    }
})
const DropdownComponent = defineComponent({
    prpps: {
        option: {
            type: Object
        }
    },
    setup(props, ctx) {
        const state = reactive({
            option: props.option || {title: '', content: () => {}},
            isShow: false,
            top: 0,
            left: 0
        })

        // 组件暴露方法
        ctx.expose({
            showDropdown(option) {
                state.option = option
                state.isShow = true
                let { top, left,height } = option.el.getBoundingClientRect()
                state.top = top + height
                state.left = left
            }
        })

        provide('hide', () => state.isShow = false)

        const classes = computed(() => ['dropdown', {
            'dropdown-isShow': state.isShow
        }])
        const styles = computed(() => ({
            top: state.top + 'px',
            left: state.left + 'px'
        }))
        const el = ref(null)
        const onMousedownDocument = (e) => {
            // 点击的是下拉菜单，不处理
            /**
             * 两种方式判断，当前点击的是不是弹窗里面
             */
            // 方式一 通过classList判断
            // if(e.target.classList.contains('dropdown')) return
            // 方式二 通过元素判断
            if(!el.value.contains(e.target)) {
                state.isShow = false
            }
        }
        onMounted(() => {
            // 事件的传递是，先捕获，再冒泡
            document.addEventListener('mousedown', onMousedownDocument, true)
        })
        onBeforeUnmount(() => {
            document.removeEventListener('mousedown', onMousedownDocument)
        })

        return () => {
            console.log("state.option",state.option);
            return <div class={classes.value} style={styles.value} ref={el}>{state.option.content()}</div>
        }
    }
})
/**
 * 传进来的配置
 * @param {Object} option 配置参数
 */
let vm;
export function $dropdown(option) {
    if(!vm) {
        let el = document.createElement('div')
        vm = createVNode(DropdownComponent, {option})
        document.body.appendChild((render(vm,el), el))
    }
    
    // 将组件渲染到整个el元素上
    let { showDropdown } = vm.component.exposed
    showDropdown(option)
}