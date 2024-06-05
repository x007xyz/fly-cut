<template>
  <div class="p-4 flex-1 overflow-hidden flex flex-col">
    <div class="bg-zinc-200 h-10 flex items-center justify-center rounded text-sm text-gray-900 cursor-pointer" @click="onUpload">
      <i class="iconfont icon-shangchuan_line mr-2" />
      本地视频
    </div>
  </div>
</template>

<script setup lang="ts">
  import { usePlayerState } from '@/stores/playerState';
  import { useTrackState } from '@/stores/trackState';
  import { videoDecoder } from '@/utils/webcodecs';
  import { ElMessage } from 'element-plus';
  import { selectFile } from '@/utils/file';
  import { getMD5 } from '@/class/Base';
  import { VideoTrack } from '@/class/VideoTrack';

  const trackStore = useTrackState();
  const playStore = usePlayerState();

  async function onUpload() {
    // 需要将获取图片文件转换为ImageTractItem
    // 必须：图片的format、height、width、sourceFrame
    // 非必须：cover信息（如果是gif图片）
    const files = await selectFile({ accept: '.mp4', multiple: false });
    const start = performance.now();
    // TODO：生成md5时间，已经大于解析视频时间，需要优化
    const id = await getMD5(await files[0].arrayBuffer());

    console.log('生成md5耗时', performance.now() - start, 'ms');

    const clip = await videoDecoder.decode({ id, stream: files[0].stream(), type: files[0].type });

    console.log('解析视频耗时', performance.now() - start, 'ms');

    if (!clip) {
      // 提示解析视频失败
      ElMessage.error('解析视频失败');
      return;
    }

    const videoTrack = new VideoTrack({
      id,
      url: URL.createObjectURL(files[0]),
      name: files[0].name,
      format: files[0].type,
      width: clip.meta.width,
      height: clip.meta.height,
      duration: Math.round(clip.meta.duration / 1e6)
    }, playStore.playStartFrame);

    videoTrack.resize({ width: playStore.playerWidth, height: playStore.playerHeight });

    trackStore.addTrack(videoTrack);
  }
</script>

<style scoped>

</style>