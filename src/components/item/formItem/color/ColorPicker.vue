<script setup lang="ts">
import { Sketch } from '@ckpack/vue-color'
import defaultColors from './colorSet'

const props = defineProps({
  modelValue: {
    type: String,
    default() {
      return ''
    },
  },
})
const emit = defineEmits({
  'update:modelValue': (val) => {
    return val !== null
  },
})

function onUpdate(value: any) {
  if (value.rgba.a === 0) {
    emit('update:modelValue', '')
  }
  else {
    emit('update:modelValue', value.hex)
  }
}
</script>

<template>
  <el-popover
    placement="bottom"
    :width="220"
    trigger="click"
  >
    <template #reference>
      <div class="h-8 flex flex-row items-center cursor-pointer">
        <span
          class="w-6 h-4 block mr-4 border border-gray-500"
          :style="{ backgroundColor: modelValue }"
        />
        <i class="not-italic">{{ modelValue }}</i>
      </div>
    </template>
    <template #default>
      <Sketch :model-value="modelValue" :preset-colors="defaultColors" @update:model-value="onUpdate" />
    </template>
  </el-popover>
</template>

<style scoped>

</style>
