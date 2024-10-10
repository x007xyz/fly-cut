<script setup lang="ts">
import { usePlayerState } from '@/stores/playerState'
import { useTrackState } from '@/stores/trackState'
import { formatPlayerTime, preciseInterval } from '@/utils/common'
import { getCurrentTrackItemList, isOfCanPlayType } from '@/utils/trackUtils'
import { VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  disable: {
    type: Boolean,
    default: false,
  },
})
const store = usePlayerState()
const trackStore = useTrackState()
const playTime = computed(() => {
  return formatPlayerTime(store.playStartFrame)
})
const allTime = computed(() => {
  return formatPlayerTime(trackStore.frameCount)
})
let playTimer: ReturnType<typeof preciseInterval> | null = null
const timeStamp = 1000 / 30
// 视频暂停
function pauseVideo() {
  store.pause()
  store.isPause = true
  playTimer?.cancel()
}
function startPlay() {
  store.play()
  store.isPause = false
  // if (props.disable)
  //   return
  if (store.playStartFrame >= trackStore.frameCount) {
    store.playStartFrame = 0
  }
  // store.isPause = false
  playTimer?.cancel()
  playTimer = preciseInterval(() => {
    store.playStartFrame++
    if (store.playStartFrame === trackStore.frameCount) {
      pauseVideo()
    }
  }, timeStamp)
}
</script>

<template>
  <div class="flex items-center justify-center absolute bottom-0 left-0 right-0 pl-4 pr-4 h-8 border-t dark:border-darker border-gray-300">
    <div class="absolute left-4 h-full text-xs leading-8">
      <span class="text-blue-400 mr-1 w-20 inline-block">{{ playTime }}</span>/<span class="ml-2 w-20">{{ allTime }}</span>
    </div>
    <div class="m-auto flex items-center">
      <ElIcon :size="24" class="cursor-pointer box-content" :class="[disable ? 'cursor-not-allowed' : 'cursor-pointer']">
        <VideoPause v-show="!store.isPause" @click="pauseVideo" />
        <VideoPlay v-show="store.isPause" @click="startPlay" />
      </ElIcon>
    </div>
  </div>
</template>

<style scoped>

</style>
