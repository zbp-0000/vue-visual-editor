import {computed, defineComponent} from "vue";

export default defineComponent({
    props: {
        start: {type: Number},
        end: {type: Number}
    },
    emits: ["update:start", "update:end"],
    setup(props, ctx) {
        const start = computed({
            get: () => props.start,
            set: (newVal) => ctx.emit("update:start", newVal)
        })
        const end = computed({
            get: () => props.end,
            set: (newVal) => ctx.emit("update:end", newVal)
        })
        return() => {
            return <div class="editor-range">
                <input type="number" v-model={start.value} />
                <span>~</span>
                <input type="number" v-model={end.value} />
            </div>
        }
    }
})