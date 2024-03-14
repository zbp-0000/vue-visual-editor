import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from './editor-block'
import { useMenuDrag } from './useMenuDrag'
import { useBlockFocus } from './useBlockFocus'

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
        const { handleDragstart, handleDragEnd } = useMenuDrag(containerRef, data)

        const { blockMousedwn, clearBlockFocus, foucsData } = useBlockFocus(data, (e) => {
            console.log(foucsData.value.focus);
        })

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
                    <div className="editor-container-content">
                        <div className="editor-container-content_canvas"
                            style={containerStyle}
                            ref={containerRef}
                            onClick={clearBlockFocus}
                        >
                            {data.value.blocks.map(block => (
                                <EditorBlock
                                    block={block}
                                    onClick={e => blockMousedwn(e, block)} 
                                    class={block.focus ? 'editor-block-focus' : ''} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})