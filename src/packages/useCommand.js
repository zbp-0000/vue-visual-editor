import { before, cloneDeep } from 'lodash'
import { onUnmounted } from 'vue'
import { events } from "./events"

export function useCommand (data, foucsData) {
    const state = {
        // 前进后退需要指针
        current: -1, // 前进后退的索引
        queue: [], // 存放所有的操作命令
        commands: {}, // 制作命令和执行功能一个映射表 undo: ()=>{}  redo: ()=>{}
        commandArray: [], // 存放所有的命令
        destroyArray: [], // 销毁
    }

    const registry = (command) => {
        state.commandArray.push(command)
        state.commands[command.name] = (...args) => {
            const { redo, undo } = command.execute(...args)
            redo()
            if (!command.pushQueue) { // 不需要放到队列中直接跳过即可
                return
            }
            let { queue, current } = state

            /**
             * 如果先放了 组件1 => 组件2 => 撤回 => 组件3
             * 栈里面应该是 组件1 => 组件3
             */
            if (queue.length > 0) {
                queue = queue.slice(0, current + 1) // 可能在放置过程中有撤销操作，所以根据当前最新的current值来操作
                state.queue = queue
            }

            queue.push({ redo, undo })
            state.current = current + 1
        }
    }

    // 注册我们需要的命令
    registry({
        name: 'redo',
        keyboard: 'ctrl+y',
        execute () {
            return {
                redo () {
                    let item = state.queue[state.current + 1] // 找到下一步还原操作
                    if (item) {
                        item.redo & item.redo()
                        state.current++
                    }
                }
            }
        }
    })
    registry({
        name: 'undo',
        keyboard: 'ctrl+z',
        execute () {
            return {
                redo () {
                    if (state.current == -1) return // 没有可撤销的了
                    let item = state.queue[state.current] // 找到上一步还原
                    if (item) {
                        item.undo & item.undo()
                        state.current--
                    }
                }
            }
        }
    })
    registry({
        name: 'drag', //如果希望将操作放到队列中可以增加一个属性，标识等会儿操作要放到队列中
        pushQueue: true,
        init () { // 初始化操作，默认就会执行
            this.before = null
            // 监控拖拽开始事件，保存状态
            const start = () => this.before = cloneDeep(data.value.blocks) // 这里进行拷贝，不然会是引用类型
            // 拖拽之后，需要触发对应的指令
            const end = () => state.commands.drag()
            events.on('start', start)
            events.on('end', end)

            return () => {
                events.off(start)
                events.off(end)
            }
        },
        execute () {
            let before = this.before // 拖拽之前的状态
            let after = data.value.blocks // 拖拽之后的状态
            return {
                redo () { // 拖拽默认一松手 就直接把当前事情做了
                    data.value = { ...data.value, blocks: after }
                },
                undo () { // 拖拽前一步
                    data.value = { ...data.value, blocks: before }
                }
            }
        }
    });
    registry({
        name: 'updateContainer', // 更新整个容器
        pushQueue: true,
        execute (newValue) {
            let state = {
                before: data.value, // 当前值
                after: newValue // 信值
            }
            return {
                redo: () => {
                    data.value = state.after
                },
                undo: () => {
                    data.value = state.before
                }
            }
        }
    })
    registry({
        name: 'placeTop',
        pushQueue: true,
        execute () {
            let before = cloneDeep(data.value.blocks)
            let after = (() => {
                // 置顶就在所有的block中找到最大的
                let { focus, unfocused } = foucsData.value
                let maxZIndex = unfocused.reduce((prve, block) => {
                    return Math.max(prve, block.zIndex)
                }, -Infinity)
                focus.forEach(block => block.zIndex = maxZIndex + 1) // 让当前选中的比最大的+1即可
                return data.value.blocks
            })()
            return {
                redo () {
                    data.value = { ...data.value, blocks: after }
                },
                undo () {
                    data.value = { ...data.value, blocks: before }
                }
            }
        }
    })
    registry({
        name: 'placeBottom',
        pushQueue: true,
        execute () {
            let before = cloneDeep(data.value.blocks)
            let after = (() => {
                let { focus, unfocused } = foucsData.value
                let minZIndex = unfocused.reduce((prve, block) => {
                    return Math.min(prve, block.zIndex)
                }, Infinity) - 1;
                // 不能直接-1，因为会出现负值，就看不见了
                if (minZIndex < 0) {
                    const dur = Math.abs(minZIndex)
                    minZIndex = 0
                    unfocused.forEach(block => block.zIndex += dur)
                }
                focus.forEach(block => block.zIndex = minZIndex)
                return data.value.blocks
            })()
            return {
                redo () {
                    data.value = { ...data.value, blocks: after }
                },
                undo () {
                    data.value = { ...data.value, blocks: before }
                }
            }
        }
    })
    registry({
        name: 'delete',
        pushQueue: true,
        execute () {
            let state = {
                before: cloneDeep(data.value.blocks),
                after: foucsData.value.unfocused // 选中的都删除了 留下的就是没选中的
            }
            return {
                redo () {
                    data.value = { ...data.value, blocks: state.after }
                },
                undo () {
                    data.value = { ...data.value, blocks: state.before }
                }
            }
        }
    })

    const keyboardEvent = (() => {
        const keyCodes = {
            90: 'z',
            89: 'y'
        }
        const onKeyDown = (e) => {
            const { ctrlKey, keyCode } = e;
            let keyString = []
            if (ctrlKey) keyString.push('ctrl')
            keyString.push(keyCodes[keyCode])
            keyString = keyString.join('+')
            state.commandArray.forEach(({ keyboard, name }) => {
                if (!keyboard) return // 没有键盘事件
                if (keyboard === keyString) {
                    state.commands[name]();
                    e.preventDefault();
                }
            })
        }
        const init = () => {
            window.addEventListener('keydown', onKeyDown)

            return () => {
                window.removeEventListener('keydown', onKeyDown)
            }
        }
        return init
    })()

    registry({
        name: 'updateBlock', // 更新某个组件
        pushQueue: true,
        execute (newBlock, oldBlock) {
            console.log('新的=',newBlock);
            console.log('旧的=',oldBlock);
            let state = {
                before: data.value.blocks,
                after: (() => {
                    let blocks = [...data.value.blocks] // 拷贝一份用于新的block
                    const index = data.value.blocks.indexOf(oldBlock) // 找到老的 需要通过老的查找
                    if (index > -1) {
                        blocks.splice(index, 1, newBlock)
                    }
                    return blocks
                })()
            }
            console.log('updateBlock=', state);
            return {
                redo: () => {
                    data.value = { ...data.value, blocks: state.after }
                },
                undo: () => {
                    data.value = { ...data.value, blocks: state.before }
                }
            }
        }
    })

        // 判断哪些有初始化init函数，init函数会返回销毁函数，把销毁函数存起来
        ; (() => {
            // 监听键盘事件
            state.destroyArray.push(keyboardEvent())

            state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()))
        })()

    // 清理绑定的事件
    onUnmounted(() => {
        state.destroyArray.forEach(fn => fn && fn())
    })
    return state
}