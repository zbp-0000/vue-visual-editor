import { computed, defineComponent, inject, ref } from "vue";
import {
    RollbackOutlined,
    RetweetOutlined,
    CloudUploadOutlined,
    CloudDownloadOutlined,
    VerticalAlignTopOutlined,
    VerticalAlignBottomOutlined,
    DeleteOutlined,
    FormOutlined,
    EyeOutlined
} from '@ant-design/icons-vue';
import { ElButton } from 'element-plus'

import "./editor.scss";
import EditorBlock from './editor-block'
import { useMenuDrag } from './useMenuDrag'
import { useBlockFocus } from './useBlockFocus'
import { useBlockDrag } from "./useBlockDrag";
import { useCommand } from "./useCommand";
import { $dialog } from "@/components/Dialog.jsx";
import { $dropdown } from "@/components/Dropdown.jsx";
import {DropdownItem} from "@/components/Dropdown.jsx";

export default defineComponent({
    props: {
        state: { type: Object }
    },
    emits: ["update:state"],
    setup (props, ctx) {
        const previewRef = ref(false) // 预览的时候，内容不能在操作了，可以点击
        const editorRef = ref(true) // 编辑状态
        const data = computed({
            get: () => props.state,
            set: (newVal) => ctx.emit("update:state", newVal)
        })
        const containerStyle = computed(() => {
            return {
                width: data.value.container.width + 'px',
                height: data.value.container.height + 'px',
            }
        })
        const config = inject('config')
        const containerRef = ref(null)

        // 实现菜单拖拽
        const { handleDragstart, handleDragEnd } = useMenuDrag(containerRef, data)

        // 实现组件聚焦
        const { blockMousedown, clearBlockFocus, containerMousedown, foucsData, laseSelectBlock } = useBlockFocus(data, previewRef, (e) => {
            mouseDown(e)
        })

        // 实现组件拖拽
        const { mouseDown, markLine } = useBlockDrag(foucsData, laseSelectBlock, data)

        const { commands } = useCommand(data, foucsData)
        const buttons = [
            {
                label: '撤销',
                icon: <RollbackOutlined />,
                handler: () => commands.undo()
            },
            {
                label: '重做',
                icon: <RetweetOutlined />,
                handler: () => commands.redo()
            },
            {
                label: '导出',
                icon: <CloudUploadOutlined />,
                handler: () => {
                    $dialog({
                        title: '导出json使用',
                        content: JSON.stringify(data.value),
                    })
                }
            },
            {
                label: '导入',
                icon: <CloudDownloadOutlined />,
                handler: () => {
                    $dialog({
                        title: '导入json使用',
                        content: '',
                        footer: true,
                        onConfirm (text) {
                            // data.value = JSON.parse(text) // 这样去更改无法保留历史记录
                            commands.updateContainer(JSON.parse(text))
                        }
                    })
                }
            },
            {
                label: '置顶',
                icon: <VerticalAlignTopOutlined />,
                handler: () => commands.placeTop()
            },
            {
                label: '置底',
                icon: <VerticalAlignBottomOutlined />,
                handler: () => commands.placeBottom()
            },
            {
                label: '删除',
                icon: <DeleteOutlined />,
                handler: () => commands.delete()
            },
            {
                label: () => previewRef.value ? '编辑' : '预览',
                icon: () => previewRef.value ? <FormOutlined /> : <EyeOutlined />,
                handler: () => {
                    previewRef.value = !previewRef.value;
                    clearBlockFocus()
                }
            },
            {
                label: '关闭',
                icon: <DeleteOutlined />,
                handler: () => {
                    editorRef.value = false
                    clearBlockFocus()
                }
            }
        ]

        const onContextmenuBlock = (e, block) => {
            e.preventDefault()
            $dropdown({
                el: e.target, // 以哪个元素为主，以产生dropdown
                content: () => {
                    return <>
                        <DropdownItem label="删除" onClick={() => commands.delete()}><DeleteOutlined /></DropdownItem>
                        <DropdownItem label="置顶" onClick={() => commands.placeTop()}><VerticalAlignTopOutlined /></DropdownItem>
                        <DropdownItem label="置底" onClick={() => commands.placeBottom()}><VerticalAlignBottomOutlined /></DropdownItem>
                        <DropdownItem label="查看" onClick={() => {
                            $dialog({
                                title: '查看节点数据',
                                content: JSON.stringify(block)
                            })
                        }}><EyeOutlined /></DropdownItem>
                        <DropdownItem label="导入" onClick={() => {
                            $dialog({
                                title: '导入节点数据',
                                content: '',
                                footer: true,
                                onConfirm (text) {
                                    text = JSON.parse(text)
                                    commands.updateBlock(text, block)
                                }
                            })
                        }}><CloudDownloadOutlined /></DropdownItem>
                    </>
                }
            })
        }


        return () => !editorRef.value ? <>
            <div className="editor-container-content_canvas"
                style={containerStyle}
            >
                {data.value.blocks.map((block, index) => (
                    <EditorBlock
                        block={block}
                        class="editor-block-no-editor"
                    />
                ))}
            </div>
            <div> <ElButton type="primary" onClick={() => editorRef.value = true} >继续编辑</ElButton> </div>
        </> : (
            <div className="editor">
                <div className="editor-left">
                    <div className="editor-left-content">
                        {config.componentList.map(item => (
                            <div
                                className="editor-left-content-item"
                                draggable
                                onDragstart={(e) => handleDragstart(e, item)}
                                onDragend={(e) => handleDragEnd(e)}
                            >
                                <span className="label">{item.label}</span>
                                <div className="com">{item.preview()}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="editor-top">
                    {buttons.map((btn) => {
                        const icon = typeof btn.icon === 'function' ? btn.icon() : btn.icon
                        const label = typeof btn.label === 'function' ? btn.label() : btn.label
                        return <div onClick={btn.handler} className="editor-top-button">
                            {icon}
                            <span>{label}</span>
                        </div>
                    })}
                </div>
                <div className="editor-right">属性控制栏</div>
                <div className="editor-container">
                    {/* 负责产生滚动条 */}
                    <div className="editor-container-content">
                        {/* 内容区域 */}
                        <div className="editor-container-content_canvas"
                            style={containerStyle}
                            ref={containerRef}
                            onMousedown={containerMousedown}
                        >
                            {data.value.blocks.map((block, index) => (
                                <EditorBlock
                                    block={block}
                                    onMousedown={e => blockMousedown(e, block, index)}
                                    class={[block.focus ? 'editor-block-focus' : '', previewRef.value ? 'editor-block-no-editor' : '']}
                                    onContextmenu={e => onContextmenuBlock(e, block)}
                                />
                            ))}
                            {markLine.value.x !== null && <div className="line-x" style={{ left: markLine.value.x + 'px' }}></div>}
                            {markLine.value.y !== null && <div className="line-y" style={{ top: markLine.value.y + 'px' }}></div>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})