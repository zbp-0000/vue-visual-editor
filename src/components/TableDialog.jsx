import {createVNode, defineComponent, reactive, render} from "vue";
import {cloneDeep} from "lodash";
import {ElButton, ElDialog, ElInput, ElTable, ElTableColumn} from "element-plus";

const TableComponent = defineComponent({
    props: {
        option: {type: Object}
    },
    setup(props, ctx) {
        const state = reactive({
            option: props.option,
            isShow: false,
            editData: [] // 编辑的数据，当确认的时候，把数据抛出去
        })
        let methods = {
            show(option) {
                state.option = option // 把用户配置缓存起来
                state.isShow = true // 更改显示状态
                state.editData = cloneDeep(option.data) // 通过渲染的数据，默认显示
            }
        }
        const add = () => {
            state.editData.push({})
        }
        ctx.expose(methods)
        return () => {
            return <ElDialog v-model={state.isShow} title={state.option.config.label}>
                {{
                    default: () =>
                        (<div>
                            <div><ElButton onClick={add}>添加</ElButton><ElButton>重置</ElButton></div>
                            <ElTable data={state.editData}>
                                <ElTableColumn type="index" label='序号'></ElTableColumn>
                                {state.option.config.table.options.map((item, index) => {
                                    return <ElTableColumn label={item.label}>
                                        {{
                                            default: ({row}) => <ElInput v-model={row[item.filed]}></ElInput>
                                        }}
                                    </ElTableColumn>
                                })}
                                <ElTableColumn label="操作">
                                    <ElButton type='danger'>删除</ElButton>
                                </ElTableColumn>
                            </ElTable>
                        </div>),
                    footer: () =>
                        <>
                            <ElButton onClick={() => state.isShow = false}>取消</ElButton>
                            <ElButton type="primary" onClick={() => {
                                state.isShow = false
                                state.option.onConfirm(state.editData)
                            }}>确定</ElButton>
                        </>

                }}
            </ElDialog>
        }
    }
})
let vm
export const $TableDialog = (option) => {
    if(!vm) {
        let el = document.createElement('div')
        vm = createVNode(TableComponent, {option})
        let r = render(vm,el)
        document.body.appendChild(el)
    }

    // 将组件渲染到整个el元素上
    let { show } = vm.component.exposed
    show(option)
}