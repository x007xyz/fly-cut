<template>
  <header class="h-14 w-full flex flex-nowrap flex-row items-center justify-between border-b dark:border-gray-600 border-gray-300">
    <div class="flex w-1/3 pl-2 items-center">
      <svg
      height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32"
      data-view-component="true" class="github-icon mx-4 cursor-pointer" :class="store.isDark ? 'text-white' : 'text-black'" @click="openGithub"
      >
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
      </svg>
      <div class="ml-2">
        <img class="h-8" src="@/assets/text_logo.png" alt="">
      </div>
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

    await com.output().pipeTo(await createFileWriter());

    loading.close();

    ElMessage.success('合成视频成功');

    console.log('导出文件耗时', performance.now() - start, 'ms');
  };

  function openGithub() {
    window.open('https://github.com/x007xyz/fly-cut.git');
  }
</script>

<style>
.github-icon {
  fill: currentColor;
}
</style>
