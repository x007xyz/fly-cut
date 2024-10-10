<script setup lang="ts">
// import { CanvasPlayer } from '@/components/item/player/canvasDraw'
import PlayerControl from '@/components/item/player/PlayerControl.vue'
// import PlayerMoveable from '@/components/item/player/PlayerMoveable.vue'
import { usePlayerState } from '@/stores/playerState'
import { AVCanvas } from '@webav/av-canvas'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

// const props = defineProps({
//   containerSize: { // 容器大小
//     type: Object,
//     default() {
//       return {
//         width: 0,
//         height: 0,
//       }
//     },
//   },
// })
const store = usePlayerState()
// const playerCanvas = ref()

// const player = new CanvasPlayer({
//   player: playerCanvas,
//   containerSize: props.containerSize,
// })

const { playerWidth, playerHeight } = storeToRefs(store)

// const scale = computed(() => {
//   let { width, height } = props.containerSize
//   height -= 96 // 上下功能栏
//   width -= 16 // 左右功能栏
//   return Math.min(width / playerWidth.value, height / playerHeight.value)
// })

const playerContainerRef = ref()

const playerCanvasRef = ref()

onMounted(() => {
  // 监听playerCanvasRef尺寸变化
  const resizeObserver = new ResizeObserver((entries) => {
    // 根据宽高设置playerCanvasRef的宽高，要求宽高比为playerWidth.value / playerHeight.value，能够被完整包含
    const { width, height } = entries[0].contentRect
    const scale = Math.min(width / playerWidth.value, height / playerHeight.value)
    playerCanvasRef.value.style.width = `${playerWidth.value * scale}px`
    playerCanvasRef.value.style.height = `${playerHeight.value * scale}px`
  })
  resizeObserver.observe(playerContainerRef.value)

  store.playerCanvas = new AVCanvas(
    playerCanvasRef.value,
    {
      bgColor: '#000',
      width: playerWidth.value,
      height: playerHeight.value,
    },
  )
})
</script>

<template>
  <div ref="playerContainerRef" class="p-2 absolute top-12 bottom-10 left-2 right-2 overflow-hidden flex items-center justify-center">
    <div ref="playerCanvasRef" />
    <!-- <canvas id="player" ref="playerCanvas" class="absolute left-0 right-0 top-0 bottom-0 m-auto bg-gray-900" :style="{ zoom: scale, width: `${playerWidth}px`, height: `${playerHeight}px` }" /> -->
    <!--
 <div v-show="store.frameCount === 0 || !store.existVideo" class="absolute left-0 right-0 top-0 bottom-0 z-20 flex justify-center items-center">
      <ElIcon :size="144" class="box-content opacity-50" :style="{ color: '#FDE68A' }">
        <VideoCameraFilled />
      </ElIcon>
    </div>
-->
    <!-- <Loading class="justify-center pl-0 bg-opacity-0" /> -->
    <!-- <PlayerMoveable :style="{ zoom: scale, width: `${playerWidth}px`, height: `${playerHeight}px` }" /> -->
  </div>
  <PlayerControl />
</template>
