import { computed, defineComponent, inject, ref, watch } from "vue";
import { 
    RollbackOutlined, 
    RetweetOutlined, 
    CloudUploadOutlined, 
    CloudDownloadOutlined, 
    VerticalAlignTopOutlined, 
    VerticalAlignBottomOutlined,
    DeleteOutlined
} from '@ant-design/icons-vue';

import "./editor.scss";
import EditorBlock from './editor-block'
import { useMenuDrag } from './useMenuDrag'
import { useBlockFocus } from './useBlockFocus'
import { useBlockDrag } from "./useBlockDrag";
import { useCommand } from "./useCommand";
import { $dialog } from "@/components/Dialog.jsx";

export default defineComponent({
    props: {
        state: { type: Object }
    },
    emits: ["update:state"],
    setup (props, ctx) {
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
        const { blockMousedwn, clearBlockFocus, foucsData, laseSelectBlock } = useBlockFocus(data, (e) => {
            mouseDown(e)
        })

        // 实现组件拖拽
        const { mouseDown, markLine } = useBlockDrag(foucsData, laseSelectBlock, data)

        const { commands } = useCommand(data, foucsData)
        const buttons = [
            {
                label: '撤销',
                icon: <RollbackOutlined style={{ fontSize: '20px' }} />,
                handler: () => commands.undo()
            },
            {
                label: '重做',
                icon: <RetweetOutlined style={{ fontSize: '20px' }} />,
                handler: () => commands.redo()
            },
            {
                label: '导出',
                icon: <CloudUploadOutlined style={{ fontSize: '20px' }} />,
                handler: () => {
                    $dialog({
                        title: '导出json使用',
                        content: JSON.stringify(data.value),
                    })
                }
            },
            {
                label: '导入',
                icon: <CloudDownloadOutlined style={{ fontSize: '20px' }} />,
                handler: () => {
                    $dialog({
                        title: '导入json使用',
                        content: '',
                        footer: true,
                        onConfirm(text) {
                            // data.value = JSON.parse(text) // 这样去更改无法保留历史记录
                            commands.updateContainer(JSON.parse(text))
                        }
                    })
                }
            },
            {
                label: '置顶',
                icon: <VerticalAlignTopOutlined style={{ fontSize: '20px' }} />,
                handler: () => commands.placeTop()
            },
            {
                label: '置底',
                icon: <VerticalAlignBottomOutlined style={{ fontSize: '20px' }} />,
                handler: () => commands.placeBottom()
            },
            {
                label: '删除',
                icon: <DeleteOutlined style={{ fontSize: '20px' }} />,
                handler: () => commands.delete()
            }
        ]


        return () => (
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
                    {buttons.map((btn) => (
                        <div onClick={btn.handler} className="editor-top-button">
                            {btn.icon}
                            <span>{btn.label}</span>
                        </div>
                    ))}
                </div>
                <div className="editor-right">属性控制栏</div>
                <div className="editor-container">
                    {/* 负责产生滚动条 */}
                    <div className="editor-container-content">
                        {/* 内容区域 */}
                        <div className="editor-container-content_canvas"
                            style={containerStyle}
                            ref={containerRef}
                            onMousedown={clearBlockFocus}
                        >
                            {data.value.blocks.map((block, index) => (
                                <EditorBlock
                                    block={block}
                                    onMousedown={e => blockMousedwn(e, block, index)}
                                    class={block.focus ? 'editor-block-focus' : ''} />
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