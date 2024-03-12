export function useMenuDrag (containerRef, data) {
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
    return {
        handleDragstart,
        handleDragEnd
    }
}