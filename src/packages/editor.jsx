import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from './editor-block'
import { useMenuDrag } from './useMenuDrag'

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
        // const { handleDragestart, handleDragEnd } = useMenuDrag(containerRef, data)

        let currentComponent
        const handleDragstart = (e, component) => {
            // 进入目标容器内， 添加一个移动比标识
            containerRef.value.addEventListener("dragenter", dragenter, false);
            // 经过目标容器  阻止默认动作以启用drop
            containerRef.value.addEventListener("dragover", dragover, false);
            // 当拖动元素离开可放置目标节点， 添加一个禁用标识
            containerRef.value.addEventListener("dragleave", dragleave, false);
            // 将拖动的元素到所选择的放置目标节点中
            containerRef.value.addEventListener("drop", drop, false);

            currentComponent = component
        }
        const handleDragEnd = (e) => {
            containerRef.value.removeEventListener("dragenter", dragenter, false);
            containerRef.value.removeEventListener("dragover", dragover, false);
            containerRef.value.removeEventListener("dragleave", dragleave, false);
            containerRef.value.removeEventListener("drop", drop, false);
        }
        const dragenter = (e) => {
            e.dataTransfer.dropEffect = 'copy'
        }
        const dragover = (e) => {
            e.preventDefault();
        }
        const dragleave = (e) => {
            e.dataTransfer.dropEffect = 'none'
        }
        const drop = (e) => {
            data.value = {
                ...data.value,
                blocks: [
                    ...data.value.blocks,
                    {
                        top: e.offsetY,
                        left: e.offsetX,
                        zIndex: 1,
                        key: currentComponent.key,
                        alignCenter: true
                    }]
            }

            currentComponent = null
        }

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
                        >
                            {data.value.blocks.map(block => (
                                <EditorBlock block={block} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})