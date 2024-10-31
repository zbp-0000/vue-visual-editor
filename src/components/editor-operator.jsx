import {defineComponent, inject, reactive, watch} from "vue";
import {ElForm, ElFormItem, ElButton, ElInputNumber, ElInput, ElColorPicker, ElSelect, ElOption} from "element-plus";
import {cloneDeep} from "lodash";

export default defineComponent({
    props: {
        block: Object, // 用户最后选中的元素
        data: Object, // 当前所有的数据
        updateContainer: Function,
        updateBlock: Function
    },
    setup(props, ctx) {
        const config = inject('config') // 组件的配置信息
        const state = reactive({
            editData: {}
        })
        const reset = () => {
            if(!props.block) { // 说明要绑定的是容器的宽度和高度
                state.editData = cloneDeep(props.data.container)
            } else {
                state.editData = cloneDeep(props.block)
            }
        }
        const apply = () => {
            if(!props.block) { // 更改组件容器的大小
                props.updateContainer({...props.data, container: state.editData})
            } else { // 更改组件的位置
                console.log("state.editData",state.editData);
                console.log("props.block",props.block);
                props.updateBlock(state.editData, props.block)
            }
        }
        watch(() => props.block, reset, {immediate: true})
        watch(() => props.block, (newBlock) => console.log("newBlock",newBlock))
        return () => {
            let content = []
            if(!props.block) {
                content.push(<>
                    <ElFormItem label="容器宽度">
                        <ElInputNumber v-model={state.editData.width}></ElInputNumber>
                    </ElFormItem>
                    <ElFormItem label="容器高度">
                        <ElInputNumber v-model={state.editData.height}></ElInputNumber>
                    </ElFormItem>
                </>)
            } else {
                let component = config.componentMap[props.block.key]
                if(component && component.props) { // {text:{type:'xxx'},size:{},color:{}}
                    const el = Object.entries(component.props).map(([propName, propConfig]) => {
                        return <ElFormItem label={propConfig.label}>
                            {{
                                input: () => <ElInput v-model={state.editData.props[propName]}></ElInput>,
                                color: () => <ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>,
                                select: () => <ElSelect v-model={state.editData.props[propName]}>
                                    {propConfig.options.map(item => <ElOption label={item.label} value={item.value}></ElOption>)}
                                </ElSelect>,
                            }[propConfig.type]()}
                        </ElFormItem>
                    })
                    content.push(el)
                }
            }
            return <ElForm labelPosition="top" style='padding:30px'>
                {content}
                <ElFormItem>
                    <ElButton type = "primary" onClick={() => apply()}>应用</ElButton>
                    <ElButton onClick={reset}>重置</ElButton>
                </ElFormItem>
            </ElForm>
        }
    }
})