import { computed, ref } from 'vue'
/**
 * 获取哪些对象被选中了
 * @param {Object} data 已有的菜单数据
 * @param {callback} callback 回调函数 
 */
export function useBlockFocus (data, callback) {
    const selectIndex = ref(-1) // 当前被选中的block的索引
    const laseSelectBlock = computed(() => data.value.blocks[selectIndex.value])

    const clearBlockFocus = () => {
        data.value.blocks.forEach(block => {
            block.focus = false
        });
        selectIndex.value = -1
    }

    const blockMousedwn = (e, block, idx) => {
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
        selectIndex.value = idx
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
        foucsData,
        laseSelectBlock
    }
}