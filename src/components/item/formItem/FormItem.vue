<script setup lang="ts">
import AttrContainer from '@/components/item/formItem/AttrContainer.vue'
import ColorPicker from '@/components/item/formItem/color/ColorPicker.vue'
import { useTrackState } from '@/stores/trackState'
import { get, set } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const props = defineProps({
  componentData: {
    type: Object,
    default() {
      return {}
    },
  },
  index: {
    type: Number,
    default: 0,
  },
})
const trackStore = useTrackState()
const activeIndex = ref(props.componentData.defaultValue) // 内部状态
const { selectResource, selectTrackItem, trackList } = storeToRefs(trackStore)
const formValue = computed({
  get() {
    if (selectResource.value) {
      return get(toRaw(trackList.value[selectTrackItem.value.line].list[selectTrackItem.value.index]), props.componentData.mappingKey)
    }
    else {
      return null
    }
  },
  set(value) {
    if (selectResource.value && props.componentData.mappingKey) {
      set(trackList.value[selectTrackItem.value.line].list[selectTrackItem.value.index], props.componentData.mappingKey, value)
    }
  },
})
</script>

<template>
  <el-tabs
    v-if="componentData.dataType === 'Tabs'"
    v-bind="componentData.attr || {}"
    v-model="activeIndex"
  >
    <AttrContainer :attr-data="componentData.children" />
  </el-tabs>
  <el-tab-pane
    v-else-if="componentData.dataType === 'TabPane'"
    :key="index"
    :label="componentData.name"
    :name="index"
  >
    <AttrContainer :attr-data="componentData.children" />
  </el-tab-pane>
  <el-collapse
    v-else-if="componentData.dataType === 'Collapse'"
    v-model="activeIndex"
  >
    <AttrContainer :attr-data="componentData.children" />
  </el-collapse>
  <el-collapse-item
    v-else-if="componentData.dataType === 'CollapsePane'"
    :title="componentData.name"
    :name="index"
  >
    <AttrContainer :attr-data="componentData.children" />
  </el-collapse-item>
  <el-radio
    v-else-if="componentData.dataType === 'RadioItem'"
    :label="componentData.value"
    size="large"
  >
    {{ componentData.name }}
  </el-radio>
  <el-radio-button
    v-else-if="componentData.dataType === 'RadioButtonItem'"
    :label="componentData.value"
    size="small"
  >
    {{ componentData.name }}
  </el-radio-button>
  <div v-else-if="componentData.dataType === 'Slider'" class="formItem">
    <span v-show="componentData.name" class="formTitle">{{ componentData.name }}</span>
    <div class="formContent">
      <el-slider v-model="formValue" v-bind="componentData.attr" />
    </div>
    <span class="ml-2 w-12 text-center text-sm leading-8">{{ formValue }}{{ componentData.label }}</span>
  </div>
  <div v-else-if="componentData.dataType === 'String'" class="formItem">
    <span v-show="componentData.name" class="formTitle">{{ componentData.name }}</span>
    <div class="formContent">
      <el-input v-model="formValue" type="textarea" v-bind="componentData.attr" />
    </div>
  </div>
  <div v-else-if="componentData.dataType === 'Number'" class="formItem">
    <span v-show="componentData.name" class="formTitle">{{ componentData.name }}</span>
    <div class="formContent">
      <el-input-number v-model="formValue" v-bind="componentData.attr" />
    </div>
  </div>
  <div v-else-if="componentData.dataType === 'Radio'" class="formItem">
    <span v-show="componentData.name" class="formTitle">{{ componentData.name }}</span>
    <div class="formContent">
      <el-radio-group v-model="formValue" v-bind="componentData.attr">
        <AttrContainer :attr-data="componentData.children" />
      </el-radio-group>
    </div>
  </div>
  <div v-else-if="componentData.dataType === 'RadioButton'" class="formItem">
    <span v-show="componentData.name" class="formTitle">{{ componentData.name }}</span>
    <div class="formContent">
      <el-radio-group v-model="formValue" v-bind="componentData.attr">
        <AttrContainer :attr-data="componentData.children" />
      </el-radio-group>
    </div>
  </div>
  <div v-else-if="componentData.dataType === 'Boolean'" class="formItem">
    <span v-show="componentData.name" class="formTitle">{{ componentData.name }}</span>
    <div class="formContent">
      <el-switch v-model="formValue" v-bind="componentData.attr" />
    </div>
  </div>
  <div v-else-if="componentData.dataType === 'TextArea'" class="formItem">
    <span v-show="componentData.name" class="formTitle">{{ componentData.name }}</span>
    <div class="formContent">
      <el-input
        v-model="formValue"
        v-bind="componentData.attr"
        type="textarea"
      />
    </div>
  </div>
  <div v-else-if="componentData.dataType === 'Color'" class="formItem">
    <span v-show="componentData.name" class="formTitle">{{ componentData.name }}</span>
    <div class="formContent">
      <ColorPicker v-model="formValue" v-bind="componentData.attr" />
    </div>
  </div>
  <div v-else-if="componentData.dataType === 'Flex'" class="formItem">
    <span v-show="componentData.name" class="formTitle">{{ componentData.name }}</span>
    <div class="formContentFlex">
      <AttrContainer :attr-data="componentData.children" :style="{ width: `${96 / componentData.attr.col}%` }" />
    </div>
  </div>
</template>

<style scoped>
  .formItem {
    @apply w-full leading-8 flex flex-row grow-0 shrink-0 mb-2 justify-start items-start;
  }
  .formTitle{
    @apply w-20 text-sm block leading-8 pl-2 pr-3 text-left dark:text-gray-200 text-gray-600 shrink-0;
  }
  .formContent{
    @apply min-h-8 leading-8 flex-1 flex flex-row items-center;
  }
  .formContentFlex{
    @apply flex flex-row flex-wrap flex-1 overflow-x-hidden shrink-0 justify-between
  }
  .formContentFlex .formTitle{
    @apply w-auto pl-0 pr-2;
  }
  .formContentFlex .formItem{
    @apply mb-0;
  }
</style>
