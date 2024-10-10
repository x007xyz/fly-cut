import { defineStore } from 'pinia'
import { reactive, ref, toRefs } from 'vue'
import type { AVCanvas } from '@webav/av-canvas'
import type { VisibleSprite } from '@webav/av-cliper'

export const usePlayerState = defineStore('playerState', () => {
  const playerCanvas = ref<AVCanvas | undefined>(undefined)
  const ingLoadingCount = ref(0)
  // 要播放的总帧数
  const playerConfig = reactive({
    frameCount: 0,
    playerWidth: 1080,
    playerHeight: 1920,
  })
  const playStartFrame = ref(0) // 当前播放帧
  const isPause = ref(true)

  function addSprite(sprite: VisibleSprite) {
    if (!playerCanvas.value) {
      console.error('playerCanvas is not initialized')
      return
    }

    setTimeout(() => {
      // 设置sprite的内容在playerCanvas中，并且居中显示
      // 获取缩放比例
      let scale = Math.min(playerConfig.playerWidth / sprite.rect.w, playerConfig.playerHeight / sprite.rect.h)

      scale = scale > 1 ? 1 : scale

      const width = sprite.rect.w * scale
      const height = sprite.rect.h * scale
      // 左上角坐标
      const x = (playerConfig.playerWidth - width) / 2
      const y = (playerConfig.playerHeight - height) / 2
      sprite.rect.x = x
      sprite.rect.y = y
      sprite.rect.w = width
      sprite.rect.h = height
      console.log('addSprite', playerCanvas.value)
      playerCanvas.value.addSprite(sprite)
    }, 0)
  }

  function play() {
    if (!playerCanvas.value) {
      console.error('playerCanvas is not initialized')
      return
    }
    console.log('play', toRaw(playerCanvas.value))
    toRaw(playerCanvas.value).play({ start: playStartFrame.value })
  }

  function pause() {
    if (!playerCanvas.value) {
      console.error('playerCanvas is not initialized')
      return
    }
    toRaw(playerCanvas.value).pause()
  }

  return {
    isPause,
    playStartFrame,
    ingLoadingCount,
    ...toRefs(playerConfig),
    playerCanvas,
    addSprite,
    play,
    pause,
  }
})
