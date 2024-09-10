<script setup lang="ts">
import { AudioTrack } from '@/class/AudioTrack'
import { getMD5 } from '@/class/Base'
import { usePlayerState } from '@/stores/playerState'
import { useTrackState } from '@/stores/trackState'
import { selectFile } from '@/utils/file'
import { audioDecoder } from '@/utils/webcodecs'
import { ElMessage } from 'element-plus'

// const selectedMenu = ref('recommend')
// function onSelect(selected: { value: string }) {
//   selectedMenu.value = selected.value
// }

const trackStore = useTrackState()
const playStore = usePlayerState()

async function onUpload() {
  /**
   * TODO: 待优化，有些任务可以并发
   */
  const files = await selectFile({ accept: 'audio/*', multiple: false })

  const id = await getMD5(await files[0].arrayBuffer())

  const clip = await audioDecoder.decode({ id, stream: files[0].stream(), type: files[0].type })

  if (!clip) {
    // 提示解析视频失败
    ElMessage.error('解析音频失败')
    return
  }

  const audioTrack = new AudioTrack({
    id,
    url: URL.createObjectURL(files[0]),
    name: files[0].name,
    format: files[0].type,
    duration: Math.round(clip.meta.duration / 1e6),
  }, playStore.playStartFrame)

  trackStore.addTrack(audioTrack)
}
</script>

<template>
  <div class="p-4 flex-1 overflow-hidden flex flex-col">
    <div class="bg-zinc-200 h-10 flex items-center justify-center rounded text-sm text-gray-900 cursor-pointer" @click="onUpload">
      <i class="iconfont icon-shangchuan_line mr-2" />
      本地音频
    </div>
  </div>
</template>

<style scoped>

</style>
