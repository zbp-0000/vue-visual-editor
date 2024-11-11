import {computed, defineComponent} from "vue";
import {cloneDeep} from "lodash";
import {ElButton, ElTag} from "element-plus";
import {$TableDialog} from "@/components/TableDialog.jsx";

export default defineComponent({
    props: {
        propConfig: {type: Object},
        modelValue: {type: Array}
    },
    emits: ['update:modelValue'],
    setup(props, ctx) {
        const data = computed({
            get: () => props.modelValue || [],
            set: (newVal) => ctx.emit('update:modelValue', cloneDeep(newVal))
        })
        const add = () => {
            $TableDialog({
                config: props.propConfig,
                data: data.value,
                onConfirm(value) {
                    data.value = value;
                }
            })
        }
        return () => <div>
            {(!data.value || data.value.length === 0) && <ElButton onClick={() => add()}>添加</ElButton>}
            {(data.value || []).map(item => <ElTag onClick={add}>{item[props.propConfig.table.key]}</ElTag>)}
        </div>
    }
})