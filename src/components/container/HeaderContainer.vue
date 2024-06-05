<template>
  <header class="h-14 w-full flex flex-nowrap flex-row items-center justify-between border-b dark:border-gray-600 border-gray-300">
    <div class="flex w-1/3 pl-2 items-center">
      <!-- <span class="text-xs select-none ml-4">自动保存：2023-02-10 00:51</span> -->
    </div>
    <div class="flex w-1/3 flex-row-reverse pr-10 items-center">
      <ElButton color="#683CFD" size="default" @click="onGenerate">
        <ElIcon :size="size" color="#fff" class="mr-1">
          <Download />
        </ElIcon>
        合成视频
      </ElButton>
      <el-switch
        class="mr-10"
        size="large"
        :active-icon="Moon"
        :inactive-icon="Sunny"
        :inline-prompt="inner"
        v-model="store.isDark"
        :style="switchClass"
      /> 
</div>
  </header>
</template>

<script setup lang="ts">
  /* eslint-disable camelcase */
  import { ref, computed } from 'vue';
  import { Download, Sunny, Moon, Back } from '@element-plus/icons-vue';
  import { usePageState } from '@/stores/pageState';
  import { useTrackState } from '@/stores/trackState';
  import { usePlayerState } from '@/stores/playerState';
  import { AudioTrack } from '@/class/AudioTrack';
  import type { Track } from '@/class/Track';
  import { Combinator, type OffscreenSprite } from '@webav/av-cliper';
  import { createFileWriter } from '@/utils/common';
  import { ElLoading, ElMessage } from 'element-plus';

  const trackState = useTrackState();

  const playerState = usePlayerState();

  const store = usePageState();
  const size = ref(14);
  const inner = ref(true);
  const switchClass = computed(() => ({
    '--el-switch-border-color': store.isDark ? '#4B5563' : '#D1D5DB',
    '--el-color-white': store.isDark ? '#F3F4F6' : '#374151'
  }));

  const onGenerate = async() => {
    const loading = ElLoading.service({ text: '正在合成视频' });
    const start = performance.now();
    const sprs: Promise<OffscreenSprite>[] = [];
    // 使用OffscreenSprite和Combinator进行视频合成
    for (const track of trackState.trackList.reduce((res, { list }) => res.concat(list), [] as Track[])) {
      if (track instanceof AudioTrack) {
        sprs.push(toRaw(track).combine());
      } else {
        sprs.push(toRaw(track).combine({ width: playerState.playerWidth, height: playerState.playerHeight }, 6));
      }
    }

    const sprites = await Promise.all(sprs);

    console.log('生成sprite耗时', performance.now() - start, 'ms');

    const com = new Combinator({
      width: 1080,
      height: 1920,
      bgColor: 'black'
    });

    await Promise.all(sprites.map((sprite, index) => {
      sprite.zIndex = 999 - index;
      return com.addSprite(sprite);
    }));

    console.log('合成耗时', performance.now() - start, 'ms');

    com.output().pipeTo(await createFileWriter());

    loading.close();

    ElMessage.success('合成视频成功');

    console.log('导出文件耗时', performance.now() - start, 'ms');
  };
</script>
