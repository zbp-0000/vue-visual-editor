export function useBlockDrag(foucsData) {
    let dragState = {
        startY: 0,
        startX: 0,
        startPosition: []
    }
    const mouseDown = (e) => {
        // 记录鼠标按下的位置
        dragState = {
            startY: e.clientY,
            startX: e.clientX,
            // 记录每个选中的元素的位置，方便后续计算
            startPosition: foucsData.value.focus.map(({left, top}) => ({left, top}))
        }
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
    }
    const mouseMove = (e) => {
        const { clientX:moveX, clientY:moveY } = e
        const dragX = moveX - dragState.startX
        const dragY = moveY - dragState.startY
        // 因为foucsData是一个计算属性获取到的值，所以直接修改，props可以代理数据
        foucsData.value.focus.forEach((el, idx) => {
            el.left = dragState.startPosition[idx].left + dragX
            el.top = dragState.startPosition[idx].top + dragY
        })
    }
    const mouseUp = () => {
        document.removeEventListener('mousemove', mouseMove)
        document.removeEventListener('mouseup', mouseUp)
    }

    return {
        mouseDown
    }
}