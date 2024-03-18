import { computed } from 'vue'
export function useBlockFocus (data, callback) {
    const clearBlockFocus = () => {
        data.value.blocks.forEach(block => {
            block.focus = false
        });
    }

    const blockMousedwn = (e, block) => {
        e.stopPropagation()
        e.preventDefault()
        // block上我们规划一个属性，focus 获取焦点后就将focus变为true
        if (e.shiftKey) {
            // 当前只有一个节点被选中时，按住shift，也不会focus
            if (foucsData.value.focus.length <= 1) block.focus = true;
            else block.focus = !block.focus
        } else {
            if (!block.focus) {
                clearBlockFocus()
                block.focus = true
            }
        }
        callback(e)
    }

    const foucsData = computed(() => {
        let focus = []
        let unfocused = []
        data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block))
        return {
            focus,
            unfocused
        }
    })


    return {
        clearBlockFocus,
        blockMousedwn,
        foucsData
    }
}