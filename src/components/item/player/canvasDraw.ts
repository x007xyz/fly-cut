import { usePlayerState } from '@/stores/playerState'
import { useTrackState } from '@/stores/trackState'
import { reactive, watch } from 'vue'
import type { Ref } from 'vue'

export class CanvasPlayer {
  player: Ref<HTMLCanvasElement> // 播放器
  playerContext: ImageBitmapRenderingContext | null = null
  playerStore: Record<string, any>
  trackState: Record<string, any>
  containerSize: Record<string, any>
  canvasSize = reactive({
    width: 0,
    height: 0,
  })

  constructor(options: Record<string, any>) {
    this.player = options.player
    this.containerSize = options.containerSize

    onMounted(() => {
      this.playerContext = this.player.value.getContext('bitmaprenderer')
    })

    this.playerStore = usePlayerState()
    this.trackState = useTrackState()
    this.initWatch()
  }

  initWatch() {
    // 容器大小变化
    // watch([this.containerSize], () => {
    //     this.updateCanvasSize();
    // });
    // 属性变化后重新渲染
    watch([() => this.trackState.trackList, () => this.canvasSize, () => this.playerStore.playStartFrame], () => this.drawCanvas(), { deep: true })
  }
  // getCanvasRect() {
  //     let { width, height } = this.containerSize;
  //     height -= 96; // 上下功能栏
  //     width -= 16; // 左右功能栏
  //     const { playerWidth, playerHeight } = this.playerStore;
  //     const scaleWidth = playerWidth !== 0 ? Math.floor(height / playerHeight * playerWidth) : width; // 等高情况下的宽度
  //     const scaleHeight = playerHeight !== 0 ? Math.floor(width / playerWidth * playerHeight) : height; // 等宽情况啊下的高度
  //     const canvasWidth = Math.min(scaleWidth, width);
  //     const canvasHeight = Math.min(scaleHeight, height);

  //     return { canvasWidth, canvasHeight };
  // }
  // 更新尺寸
  // updateCanvasSize() {
  //     /**
  //      * 希望实际尺寸为正常手机的尺寸，1920*1080，较大尺寸
  //      * 但是在画布上展示时，不需要这么大尺寸，会对渲染性能有影响
  //      * 所以画布尺寸还是按照实际展示尺寸来计算，最终生成时，再使用1920*1080
  //      */
  //     const { canvasWidth, canvasHeight } = this.getCanvasRect();
  //     if (this.canvasSize.width !== canvasWidth || this.canvasSize.height !== canvasHeight) {
  //         this.canvasSize.width = canvasWidth;
  //         this.canvasSize.height = canvasHeight;
  //         // 设置实际画布尺寸
  //         this.player.value.width = canvasWidth;
  //         this.player.value.height = canvasHeight;

  //         // 将画板宽高存储到playerState中
  //         this.playerStore.canvasOptions = { width: canvasWidth, height: canvasHeight };
  //     }
  // }
  // 绘制
  async drawCanvas() {
    if (this.playerStore.ingLoadingCount !== 0)
      return
    const offCanvas = new OffscreenCanvas(this.playerStore.playerWidth, this.playerStore.playerHeight)
    const ctx = offCanvas.getContext('2d')
    const videoList: Array<any> = []
    this.trackState.trackList.forEach(({ list }) => {
      const trackItem = list.find((item: Record<string, any>) => {
        if (this.playerStore.playStartFrame >= item.start && this.playerStore.playStartFrame <= item.end && !['audio'].includes(item.type)) {
          return true
        }
        return false
      })

      trackItem && videoList.unshift(() => this.drawToRenderCanvas(ctx, trackItem, this.playerStore.playStartFrame))
    })
    await videoList.reduce((chain, nextPromise) => chain.then(() => nextPromise()), Promise.resolve()) // 顺序绘制，保证视频在底部
    this.drawToPlayerCanvas(offCanvas)
  }

  // 预渲染canvas先加载
  drawToRenderCanvas(ctx: OffscreenCanvasRenderingContext2D, trackItem: Record<string, any>, frameIndex: number) {
    return toRaw(trackItem).draw(ctx, { width: this.playerStore.playerWidth, height: this.playerStore.playerHeight }, frameIndex).then(() => {
      return true
    })
  }

  // 将预渲染好的canvas进行渲播放器渲染
  async drawToPlayerCanvas(canvas: OffscreenCanvas) {
    if (this.playerContext) {
      this.playerContext.transferFromImageBitmap(canvas.transferToImageBitmap())
    }
  }
}
