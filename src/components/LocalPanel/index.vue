<script setup lang="ts">
import { getMD5 } from '@/class/Base'
import { useMediaResourceStore } from '@/stores/mediaResourceStore'
import { selectFile } from '@/utils/file'
import { AudioClip, ImgClip, MP4Clip } from '@webav/av-cliper'
import * as opfs from 'opfs-tools'

const mediaSourceStore = useMediaResourceStore() // 添加这行

async function onUpload() {
  // 上传素材
  const files = await selectFile({ accept: 'audio/*,image/*,.mp4,.mov', multiple: true })

  // 1.根据素材的文件类型做不同的处理
  // 2.处理素材
  // 3.存储素材信息
  // 4.存储素材
  files.map(async (file) => {
    const fileBuffer = await file.arrayBuffer() // 获取文件的二进制数据
    // 1. 获取文件的MD5
    const id = await getMD5(fileBuffer)

    // 2. 将文件使用opfs-tools进行存储，存储结构为${id}.${file.type}
    const fileName = `/${id}/${file.type.replace('/', '.')}`
    console.log('🚀 ~ files.map ~ fileName:', fileName)
    if (!(await opfs.file(fileName).exists())) {
      await opfs.write(fileName, fileBuffer)
    }

    console.log('🚀 ~ files.map ~ id:', id)

    // 3. 根据文件类型做不同的处理
    // 先保存到MediaSourceStore
    mediaSourceStore.addResource({
      id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    })

    let clip

    const stream = file.stream()

    if (file.type.includes('audio')) {
      clip = new AudioClip(stream)
    }
    else if (file.type.includes('image')) {
      clip = new ImgClip(stream)
    }
    else if (file.type.includes('video')) {
      clip = new MP4Clip(stream)
    }

    if (!clip) {
      console.error('无法创建clip', file.type)
      return
    }

    await clip.ready

    console.log('🚀 ~ files.map ~ clip:', clip)
    const duration = clip.meta.duration

    // 4. 更新资源信息
    mediaSourceStore.updateResource(id, {
      duration,
      clip,
    })
  })
}
</script>

<template>
  <div class="p-4 flex-1 overflow-hidden flex flex-col">
    <div class="bg-zinc-200 h-10 flex items-center justify-center rounded text-sm text-gray-900 cursor-pointer" @click="onUpload">
      <i class="iconfont icon-shangchuan_line mr-2" />
      上传多媒体
    </div>
  </div>
</template>

<style scoped>

</style>
