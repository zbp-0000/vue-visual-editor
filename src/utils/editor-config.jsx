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
editorConfig.registrer({
    label: '文本',
    preview: () => <div>预览文本</div>,
    render: () => <div>渲染文本</div>,
    key: 'text'
})
editorConfig.registrer({
    label: '按钮',
    preview: () => <ElButton>预览按钮</ElButton>,
    render: () => <ElButton>渲染按钮</ElButton>,
    key: 'button'
})
editorConfig.registrer({
    label: '输入框',
    preview: () => <ElInput placeholder='预览输入框' />,
    render: () => <ElInput placeholder='渲染输入框' />,
    key: 'input'
})