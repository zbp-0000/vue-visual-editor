import { computed, defineComponent, inject, ref, watchEffect } from "vue";
import "./editor.scss";
import EditorBlock from './editor-block'
import { useMenuDrag } from './useMenuDrag'
import { useBlockFocus } from './useBlockFocus'
import { useBlockDrag } from "./useBlockDrag";

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

        return () => (
            <div className="editor">
                <div className="editor-left">
                    <div className="editor-left-content">
                        {config.componentList.map(item => (
                            <div
                                className="editor-left-content-item"
                                draggable
                                onDragstart={(e) => handleDragstart(e, item)}
                                onDragsEnd={(e) => handleDragEnd}
                            >
                                <span className="label">{item.label}</span>
                                <div className="com">{item.preview()}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="editor-top"></div>
                <div className="editor-right"></div>
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