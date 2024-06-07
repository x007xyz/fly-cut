<template>
  <div class="p-4 flex-1 overflow-hidden flex flex-col">
    <div class="bg-zinc-200 h-10 flex items-center justify-center rounded text-sm text-gray-900 cursor-pointer" @click="onUpload">
      <i class="iconfont icon-shangchuan_line mr-2" />
      本地音频
    </div>
  </div>
</template>

<script setup lang="ts">
  import { usePlayerState } from '@/stores/playerState';
  import { useTrackState } from '@/stores/trackState';
  import { AudioClip } from '@webav/av-cliper';
  import { ElMessage } from 'element-plus';
  import { selectFile } from '@/utils/file';
  import { getMD5 } from '@/class/Base';
  import { AudioTrack } from '@/class/AudioTrack';
  import { audioDecoder } from '@/utils/webcodecs';

  const selectedMenu = ref('recommend');
  function onSelect(selected: { value: string }) {
    selectedMenu.value = selected.value;
  }

  const trackStore = useTrackState();
  const playStore = usePlayerState();

  async function onUpload() {
    // 上传素材
    const files = await selectFile({ accept: 'audio/*,image/*,.mp4,.mov', multiple: true });

    // 1.根据素材的文件类型做不同的处理
    // 2.处理素材
    // 3.存储素材信息
    // 4.存储素材
    // Array.from(files).map(async file => {
    //   const id = await getMD5(await file.arrayBuffer());
    //   if (file.type.includes('audio')) {
    //     // 处理音频
    //     const clip = await audioDecoder.decode({ id, stream: file.stream(), type: file.type });

    //     if (!clip) {
    //       // 提示解析视频失败
    //       ElMessage.error('解析音频失败');
    //       return Promise.reject();
    //     }
    //   } else if (file.type.includes('image')) {
    //     // 处理图片
    //   } else if (file.type.includes('video')) {
    //     // 处理视频
    //   }
    // });

    const id = await getMD5(await files[0].arrayBuffer());

    const clip = await audioDecoder.decode({ id, stream: files[0].stream(), type: files[0].type });

    if (!clip) {
      // 提示解析视频失败
      ElMessage.error('解析音频失败');
      return;
    }

    const audioTrack = new AudioTrack({
      id,
      url: URL.createObjectURL(files[0]),
      name: files[0].name,
      format: files[0].type,
      duration: Math.round(clip.meta.duration / 1e6)
    }, playStore.playStartFrame);

    trackStore.addTrack(audioTrack);
  }
</script>

<style scoped>

</style>