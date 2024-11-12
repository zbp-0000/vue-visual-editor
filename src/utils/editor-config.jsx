import { ElInput,ElButton,ElSelect, ElOption } from 'element-plus'
import Range from '@/components/Range.jsx'
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
/*下拉框 工厂函数*/
const createTableProp = (label,table) => ({type: 'table', label,table})

editorConfig.registrer({
    label: '下拉框',
    preview: () => <ElSelect style="width: 120px">预览下拉框</ElSelect>,
    render: ({props, model}) => <ElSelect {...model.default} style="width: 120px">
        {(props.options || []).map((item, index) => <ElOption label={item.label} value={item.value} key={index}></ElOption>)}
    </ElSelect>,
    key: 'select',
    props: {
        options: createTableProp('下拉选项', {
            options: [
                {label: '显示值', filed: 'label'},
                {label: '绑定值', filed: 'value'}
            ],
            key: 'label', // 显示给用户的值，是label
        })
    },
    model: {
        default: '绑定字段'
    }
})

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
    resize: {
        width: true, // 可以更改宽度
        height: true // 可以更改高度
    },
    preview: () => <ElButton>预览按钮</ElButton>,
    render: ({props, size}) => <ElButton style={{height:size.height+'px', width:size.width+'px'}} type={props.type} size={props.size}>{props.text || '渲染按钮'}</ElButton>,
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
    resize: {
        width: true, // 可以更改宽度
    },
    preview: () => <ElInput placeholder='预览输入框' />,
    render: ({model,size}) => <ElInput style={{ width:size.width+'px'}} placeholder='渲染输入框' {...model.default} />,
    key: 'input',
    model: {
        default: '绑定字段'
    }
})
editorConfig.registrer({
    label: '范围选择器',
    preview: () => <Range placeholder='预览范围选择器'></Range>,
    render: ({model}) => <Range {...{
        start: model.start.modelValue,
        'onUpdate:start': model.start['onUpdate:modelValue'],
        end: model.end.modelValue,
        'onUpdate:end': model.end['onUpdate:modelValue']
    }}></Range>,
    key: 'range',
    model: {
        start: '开始范围字段',
        end: '结束范围字段'
    }
})