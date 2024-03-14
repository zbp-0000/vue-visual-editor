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
        if(e.shiftKey) {
            block.focus = !block.focus
        } else {
            if(block.focus) {
                block.focus = false
            } else {
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