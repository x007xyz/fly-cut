<template>
  <div
    class="flex flex-col transition-all duration-200 overflow-x-hidden border-r dark:border-gray-600 border-gray-300"
    :class="collapse ? 'w-0' : 'w-96'"
  >
    <div class="min-h-full flex flex-col overflow-hidden dark:border-gray-600 border-gray-300">
      <div class="h-12 dark:border-gray-600 border-gray-300 flex items-center justify-between">
        <span class="inline leading-10 pl-3 select-none">{{ title }}</span>
        <!--
 <ElIcon :size="16" class="mr-3 mt-1 float-right cursor-pointer p-2 box-content" @click="switchCollapse">
          <Fold />
        </ElIcon> 
-->
        <i class="iconfont icon-shuangjiantou_zuo_line" @click="switchCollapse" />
      </div>
      <ImagePanel v-if="activeKey === 'image'" />
      <VideoPanel v-if="activeKey === 'video'" />
      <AudioPanel v-if="activeKey === 'audio'" />
      <TextPanel v-if="activeKey === 'text'" /> 
</div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { getData } from '@/api/mock';
  import { useRequest } from 'vue-hooks-plus';
  import ImagePanel from './ImagePanel/index.vue';
  // import VideoPanel from './VideoPanel/index.vue';
  // import AudioPanel from './AudioPanel/index.vue';
  // import TextPanel from './TextPanel/index.vue';
  const props = defineProps({
    activeKey: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    defaultCollapse: {
      type: Boolean,
      default: false
    }
  });
  const emit = defineEmits({
    collapseChange(newCollapse: boolean) {
      return newCollapse !== null;
    }
  });
  const { data: listData, refresh } = useRequest(() => getData(props.activeKey));
  watch(() => props.activeKey, () => {
    refresh();
  });

  const title = computed(() => props.title);
  const collapse = ref(props.defaultCollapse);
  function switchCollapse() {
    collapse.value = !collapse.value;
  }
  watch(collapse, newValue => {
    emit('collapseChange', newValue);
  });
  watch(() => props.defaultCollapse, newValue => {
    collapse.value = newValue;
  });
</script>