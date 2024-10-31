import { ElInput,ElButton } from 'element-plus'

/**
 * 定义一个 editorConfig 函数 来增加可拖拽组件
 * 并且返回出去 让外面可以拿到
 */

function createEditorConfig() {
    const componentList = []
    const componentMap = {}

    return {
        componentList,
        componentMap,
        registrer: (options) => {
            componentList.push(options)
            componentMap[options.key] = options
        }
    }

}
export let editorConfig = createEditorConfig()

/*input 工厂函数*/
const createInputProp = (label) => ({type: 'input', label})
/*颜色选择器 工厂函数*/
const createColorProp = (label) => ({type: 'color', label})
/*选择器 工厂函数*/
const createSelectProp = (label, options) => ({type: 'select', label, options})

editorConfig.registrer({
    label: '文本',
    preview: () => <div>预览文本</div>,
    render: ({props}) => <span style={{color: props.color, fontSize: props.size}}>{props.text || '渲染文本'}</span>,
    key: 'text',
    props: {
        text: createInputProp('文本内容'),
        color: createColorProp('字体颜色'),
        size: createSelectProp('字体大小', [
            {label: '14px', value: '14px'},
            {label: '20px', value: '20px'},
            {label: '24px', value: '24px'}
        ])
    }
})
editorConfig.registrer({
    label: '按钮',
    preview: () => <ElButton>预览按钮</ElButton>,
    render: ({props}) => <ElButton type={props.type} size={props.size}>{props.text || '渲染按钮'}</ElButton>,
    key: 'button',
    props: {
        text: createInputProp('按钮内容'),
        type: createSelectProp('字体类型', [
            {label: '基础按钮', value: 'primary'},
            {label: '成功按钮', value: 'success'},
            {label: '文本按钮', value: 'text'},
            {label: '警告按钮', value: 'warning'},
            {label: '危险按钮', value: 'danger'}
        ]),
        size: createSelectProp('按钮大小', [
            {label: '极小', value: 'mini'},
            {label: '小', value: 'small'},
            {label: '中等', value: 'medium'},
            {label: '大', value: 'large'}
        ])
    }
})
editorConfig.registrer({
    label: '输入框',
    preview: () => <ElInput placeholder='预览输入框' />,
    render: () => <ElInput placeholder='渲染输入框' />,
    key: 'input'
})