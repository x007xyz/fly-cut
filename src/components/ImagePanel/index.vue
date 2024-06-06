<template>
  <div class="p-4 flex-1 overflow-hidden flex flex-col">
    <div class="bg-zinc-200 h-10 flex items-center justify-center rounded text-sm text-gray-900 cursor-pointer" @click="onUpload">
      <i class="iconfont icon-shangchuan_line mr-2" />
      本地图片
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTrackState } from '@/stores/trackState';
  import { usePlayerState } from '@/stores/playerState';
  import { ElMessage } from 'element-plus';
  import { imageDecoder } from '@/utils/webcodecs';
  import { selectFile } from '@/utils/file';
  import { getMD5 } from '@/class/Base';
  // import { write } from 'opfs-tools';
  import type { ImageSource } from '@/class/ImageTrack';
  import { ImageTrack } from '@/class/ImageTrack';

  const trackStore = useTrackState();
  const playStore = usePlayerState();

  async function onUpload() {
    // 需要将获取图片文件转换为ImageTractItem
    // 必须：图片的format、height、width、sourceFrame
    // 非必须：cover信息（如果是gif图片）
    const files = await selectFile({ accept: 'image/*', multiple: false });

    const id = await getMD5(await files[0].arrayBuffer());

    const frames = await imageDecoder.decode({ id, stream: files[0].stream(), type: files[0].type });

    if (!frames) {
      // 提示解析视频失败
      ElMessage.error('解析图片失败');
      return;
    }

    // 获取文件相关信息
    const imageSource: ImageSource = {
      id,
      url: id,
      name: files[0].name,
      format: files[0].type,
      width: frames[0].codedWidth,
      height: frames[0].codedHeight
    };

    // 将文件写入到文件系统
    // 写入原文件，还是写入解码后的文件？
    // write(id, files[0].stream());

    const imageTrack = new ImageTrack(imageSource, playStore.playStartFrame);

    imageTrack.resize({ width: playStore.playerWidth, height: playStore.playerHeight });

    // const url = await uploadFile(files[0]);
    trackStore.addTrack(imageTrack);
  }
</script>

<style scoped>

</style>