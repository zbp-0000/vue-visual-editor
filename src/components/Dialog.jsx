import { createVNode, defineComponent, reactive, render } from "vue";
import { ElDialog, ElInput, ElButton } from 'element-plus'


const DialogComponent = defineComponent({
    prpps: {
        option: {
            type: Object
        }
    },
    setup(props, ctx) {
        const state = reactive({
            option: props.option || {title: ''},
            isShow: false
        })

        // 组件暴露方法
        ctx.expose({
            showDialog(option) {
                state.option = option
                state.isShow = true
            },
            hideDialog() {
                state.isShow = false
            }
        })
        const onCancel = () => {
            state.isShow = false
        }
        const onConfirm = () => {
            state.isShow = false
            state.option.onConfirm && state.option.onConfirm(state.option.content)
        }
        return () => {

            return <ElDialog v-model={state.isShow} title={state.option.title}>
                {{
                    default: () => <ElInput type="textarea" v-model={state.option.content} rows="10"></ElInput>,
                    footer: () => state.option.footer && <div>
                        <ElButton onClick={onCancel}>取消</ElButton>
                        <ElButton type="primary" onClick={onConfirm}>确定</ElButton>
                    </div>
                }}
            </ElDialog>
        }
    }
})
/**
 * 传进来的配置
 * @param {Object} option 配置参数
 */
let vm;
export function $dialog(option) {
    // 类似element=plus中的el-dialog组件
    // 手动挂载组件
    if(!vm) {
        let el = document.createElement('div')
        vm = createVNode(DialogComponent, {option})
        document.body.appendChild((render(vm,el), el))
    }
    
    // 将组件渲染到整个el元素上
    let { showDialog } = vm.component.exposed
    showDialog(option)
}