<script setup lang="ts">
import AudioPng from '@/assets/audio.png'
import { getMD5 } from '@/class/Base'
import { useMediaResourceStore } from '@/stores/mediaResourceStore'
import createClip from '@/utils/createClip'
import { selectFile } from '@/utils/file'
import { getFileById, writeResourceToOPFS } from '@/utils/fileManager'
import mime from 'mime/lite'
import type { MediaResource } from '@/stores/mediaResourceStore'

const mediaSourceStore = useMediaResourceStore() // 添加这行

// 判断资源类型的函数
function isAudio(type: string): boolean {
  return type.includes('audio')
}

function isImage(type: string): boolean {
  return type.includes('image')
}

function isVideo(type: string): boolean {
  return type.includes('video')
}

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

    const extension = mime.getExtension(file.type)

    if (extension === null) {
      console.error('无法获取文件扩展名', file.type)
      return
    }

    await writeResourceToOPFS(id, extension, fileBuffer)

    // 3. 根据文件类型做不同的处理
    // 先保存到MediaSourceStore
    mediaSourceStore.addResource({
      id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      extension, // 添加extension字段
    })

    const stream = file.stream()

    const clip = await createClip(stream, file.type)

    const duration = clip.meta.duration

    // 4. 更新资源信息
    mediaSourceStore.updateResource(id, {
      duration,
      clip,
    })
  })
}

// 格式化文件大小
function formatFileSize(size: number): string {
  if (size < 1024)
    return `${size}B`
  else if (size < 1024 * 1024)
    return `${(size / 1024).toFixed(2)}KB`
  else if (size < 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(2)}MB`
  else return `${(size / (1024 * 1024 * 1024)).toFixed(2)}GB`
}

// 格式化时长
function formatDuration(duration: number): string {
  duration = duration / 1e6
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 删除资源
function deleteResource(id: string) {
  mediaSourceStore.removeResource(id)
}
/**
 * 从缓存中加载资源
 * @param resource
 */
function loadResource(resource: MediaResource) {
  (async () => {
    const fileOPFS = await getFileById(resource.id, resource.extension)

    const clip = await createClip(await fileOPFS.stream(), resource.type)

    const url = URL.createObjectURL(new Blob([await fileOPFS.arrayBuffer()]))

    // 更新资源信息
    mediaSourceStore.updateResource(resource.id, {
      url,
      clip,
    })
  })()

  return true
}

// 添加到轨道
function addToTrack(resource: any) {
  // 这里添加将资源添加到轨道的逻辑
  console.log('添加到轨道:', resource)
}
</script>

<template>
  <div class="p-4 flex-1 overflow-hidden flex flex-col">
    <div class="bg-zinc-200 h-10 flex items-center justify-center rounded text-sm text-gray-900 cursor-pointer mb-4" @click="onUpload">
      <i class="iconfont icon-shangchuan_line mr-2" />
      上传多媒体
    </div>

    <!-- 资源列表 -->
    <div class="overflow-y-auto flex-1">
      <ul class="space-y-2">
        <li v-for="resource in mediaSourceStore.resources" :key="resource.id" class="flex items-center p-2 bg-white rounded shadow">
          <div class="w-16 h-16 mr-3 bg-gray-200 rounded flex items-center justify-center overflow-hidden relative">
            <div v-if="!resource.clip && loadResource(resource)" class="loading" />
            <template v-else>
              <!-- 音频资源 -->
              <img v-if="isAudio(resource.type)" :src="AudioPng" alt="Audio" class="w-full h-full object-cover">
              <!-- 图片资源 -->
              <img v-else-if="isImage(resource.type)" :src="resource.url" alt="Image" class="w-full h-full object-cover">
              <!-- 视频资源 -->
              <video v-else-if="isVideo(resource.type)" :src="resource.url" class="w-full h-full object-cover" muted />
              <!-- 其他资源类型 -->
              <i v-else class="iconfont icon-file text-gray-500 text-2xl" />
            </template>

            <!-- 时长显示 -->
            <span v-if="isAudio(resource.type) || isVideo(resource.type)" class="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
              {{ formatDuration(resource.duration) }}
            </span>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">
              {{ resource.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatFileSize(resource.size) }}
            </p>
          </div>
          <div class="flex flex-col space-y-2">
            <button class="bg-blue-500 text-white text-xs px-2 py-1 rounded" @click="addToTrack(resource)">
              添加
            </button>
            <button class="bg-red-500 text-white text-xs px-2 py-1 rounded" @click="deleteResource(resource.id)">
              删除
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>

</style>
