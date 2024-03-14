import { computed } from 'vue'
export function useBlockFocus(data,callback) {
    const clearBlockFocus = () => {
        data.value.blocks.forEach(block => block.focus = false);
    }
    const blockMousedwn = (e, block) => {
        e.preventDefault()
        e.stopPropagation()
        if(!block.focus) {
            if(e.shiftKey) {
                block.focus = true
            } else {
                clearBlockFocus()
                block.focus = true
            }
        } else {
            block.focus = false
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