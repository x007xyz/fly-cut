<template>
  <div class="p-4 flex-1 overflow-hidden flex flex-col">
    <div class="bg-zinc-200 h-10 flex items-center justify-center rounded text-sm text-gray-900 cursor-pointer" @click="addTrackItem({ fill: '#fff' })">
      <i class="iconfont icon-tianjia_line mr-2" />
      添加文字
    </div>
    <div class="flex-1 overflow-hidden">
      <div class="overflow-y-auto h-full pt-6 scrollbar-width-none">
        <TextTemplate @addText="addTrackItem" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { usePlayerState } from '@/stores/playerState';
  import { useTrackState } from '@/stores/trackState';
  import TextTemplate from './TextTemplate.vue';
  import { TextTrack } from '@/class/TextTrack';

  const trackStore = useTrackState();
  const playStore = usePlayerState();
  function addTrackItem(style: { fill: string, stroke?: string, textBackgroundColor?: string }) {
    trackStore.addTrack(new TextTrack({
      content: '文本内容', 
      fontSize: 24,
      fontFamily: 'Arial',
      name: '文本',
      ...style
    }, playStore.playStartFrame));
  }
</script>

<style scoped>

</style>