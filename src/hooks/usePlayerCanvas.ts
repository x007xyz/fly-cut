import { usePlayerState } from '@/stores/playerState'
import { AVCanvas } from '@webav/av-canvas'
import { storeToRefs } from 'pinia'
import type { VisibleSprite } from '@webav/av-cliper'

let playerCanvas: AVCanvas | null = null

export function usePlayerCanvas(playerCanvasElement?: HTMLElement) {
  if (!playerCanvas && playerCanvasElement) {
    const playerStore = usePlayerState()
    const { playerWidth, playerHeight } = storeToRefs(playerStore)
    playerCanvas = new AVCanvas(
      playerCanvasElement!,
      {
        bgColor: '#000',
        width: playerWidth.value,
        height: playerHeight.value,
      },
    )
  }

  function addSprite(sprite: VisibleSprite) {
    if (!playerCanvas) {
      console.error('playerCanvas is not initialized')
      return
    }
    console.log('addSprite', sprite)
    playerCanvas.addSprite(sprite)
  }

  return { playerCanvas, addSprite }
}
