import { cloneDeep } from 'lodash'
import { onUnmounted } from 'vue'
import { events } from "./events"

export function useCommand(data) {
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
        state.commands[command.name] = () => {
            const { redo,undo } = command.execute()
            redo()
            if(!command.pushQueue) { // 不需要放到队列中直接跳过即可
                return
            }
            let { queue, current } = state

            /**
             * 如果先放了 组件1 => 组件2 => 撤回 => 组件3
             * 栈里面应该是 组件1 => 组件3
             */
            if(queue.length > 0) {
                queue.slice(0, current + 1) // 可能在放置过程中有撤销操作，所以根据当前最新的current值来操作
                state.queue = queue
            }

            queue.push({redo,undo})
            state.current = state.current + 1
        }
    }

    // 注册我们需要的命令
    registry({
        name: 'redo',
        keyboard: 'ctrl+y',
        execute() {
            return {
                redo() {
                    console.log('重做');
                    let item = state.queue[state.current+1] // 找到下一步还原操作
                    if(item) {
                        item.redo & item.redo()
                        state.current++
                    }
                }
            }
        }
    })
    registry({
        name: 'undo',
        keybord: 'ctrl+z',
        execute() {
            return {
                redo() {
                    console.log('撤销');
                    if(state.current == -1) return // 没有可撤销的了
                    let item = state.queue[state.current] // 找到上一步还原
                    console.log('item',item);
                    if(item) {
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
        init() { // 初始化操作，默认就会执行
            this.before = null
            // 监控拖拽开始事件，保存状态
            const start = () => this.before = cloneDeep(data.value.blocks) // 这里进行拷贝，不然会是引用类型
            // 拖拽之后，需要触发对应的指令
            const end = () => state.commands.drag()
            events.on('start', start)
            events.on('end',end)

            return () => {
                events.off(start)
                events.off(end)
            }
        },
        execute() {
            let before = this.before // 拖拽之前的状态
            let after = data.value.blocks // 拖拽之后的状态
            return {
                redo() { // 拖拽默认一松手 就直接把当前事情做了
                    data.value = {...data.value, block:after}
                },
                undo() { // 拖拽前一步
                    data.value = {...data.value, block:before}
                }
            }
        }
    });

    // 判断哪些有初始化init函数，init函数会返回销毁函数，把销毁函数存起来
    ;(() => {
        state.commandArray.forEach(command=>command.init && state.destroyArray.push(command.init()))
    })()

    // 清理绑定的事件
    onUnmounted(() => {
        state.destroyArray.forEach(fn => fn&&fn())
    })
    return state
}