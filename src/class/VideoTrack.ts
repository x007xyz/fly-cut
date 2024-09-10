import { UnitFrame2μs } from '@/data/trackConfig'
import { splitClip, videoDecoder } from '@/utils/webcodecs'
import { OffscreenSprite } from '@webav/av-cliper'
import { uniqueId } from 'lodash-es'
import type { BaseTractItem, TrackType } from './Base'

export interface VideoSource {
  id: string
  url: string
  name: string
  format: string
  duration: number
  width: number
  height: number
}

export class VideoTrack implements BaseTractItem {
  id: string
  type: TrackType = 'video'
  source: VideoSource
  name: string
  format: string
  frameCount: number
  start: number
  end: any
  centerX: number
  centerY: number
  scale: number
  height: number
  width: number
  offsetL: number
  offsetR: number
  get drawHeight() {
    return this.height * this.scale / 100
  }

  get drawWidth() {
    return this.width * this.scale / 100
  }

  constructor(source: VideoSource, curFrame: number) {
    // 设置ID
    this.id = uniqueId()
    // 设置视频信息
    this.source = source
    // 获取文件名称
    this.name = source.name
    // 获取文件类型
    this.format = source.format
    // 设置轨道信息
    this.frameCount = source.duration * 30
    this.start = curFrame
    this.end = this.start + this.frameCount

    // 设置绘制信息
    this.centerX = 0
    this.centerY = 0
    this.scale = 100
    this.height = source.height
    this.width = source.width

    // 设置裁剪信息
    this.offsetL = 0
    this.offsetR = 0
  }

  getDrawX(width: number) {
    return width / 2 - this.drawWidth / 2 + this.centerX
  }

  getDrawY(height: number) {
    return height / 2 - this.drawHeight / 2 + this.centerY
  }

  /**
   * 渲染需要优化
   * TODO: 不需要没一次都去解码
   * TODO: 优化画布渲染
   */
  draw(ctx: CanvasRenderingContext2D, { width, height }: { width: number, height: number }, frameIndex: number) {
    const frame = Math.max(frameIndex - this.start + this.offsetL, 1) // 默认展示首帧
    // const start = performance.now()
    return videoDecoder.getFrame(this.source.id, frame).then(async (vf) => {
      if (vf) {
        // console.log('渲染耗时', performance.now() - start, 'ms')
        ctx.drawImage(vf, 0, 0, this.source.width, this.source.height, this.getDrawX(width), this.getDrawY(height), this.drawWidth, this.drawHeight)
        vf?.close()
      }
    })
  }

  resize({ width, height }: { width: number, height: number }) {
    // 视频、图片元素，在添加到画布中时，需要缩放为合适的尺寸，目标是能在画布中完整显示内容
    let scale = 1
    if (this.source.width > width) {
      scale = width / this.source.width
    }
    if (this.source.height > height) {
      scale = Math.min(scale, height / this.source.height)
    }
    this.width = this.source.width * scale
    this.height = this.source.height * scale
  }

  audio: HTMLAudioElement | null = null
  play(currentFrame: number) {
    if (!this.audio) {
      this.audio = new Audio(this.source.url)
    }
    if (this.audio?.paused) {
      this.audio.currentTime = (currentFrame - this.start - this.offsetL) / 30
      // console.log('🚀 ~ VideoTrack ~ play ~ this.audio.currentTime:', this.audio.currentTime)
      this.audio.play()
    }
  }

  pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause()
    }
  }

  // 生成合成对象
  async combine(playerSize: { width: number, height: number }, outputRatio: number) {
    const video = await videoDecoder.decode({ id: this.source.id })
    const clip = await splitClip(video, { offsetL: this.offsetL, offsetR: this.offsetR, frameCount: this.frameCount })
    if (!clip) {
      throw new Error('clip is not ready')
    }
    const spr = new OffscreenSprite(clip)
    // TODO：需要支持裁剪
    spr.time = { offset: this.start * UnitFrame2μs, duration: (this.end - this.start) * UnitFrame2μs }
    spr.rect.x = this.getDrawX(playerSize.width) * outputRatio
    spr.rect.y = this.getDrawY(playerSize.height) * outputRatio
    spr.rect.w = this.drawWidth * outputRatio
    spr.rect.h = this.drawHeight * outputRatio

    return spr
  }

  split(cutFrame: number) {
    this.end = cutFrame
    this.offsetR = this.frameCount + this.start - cutFrame // 根据cutFrame对视频进行分割
    // 根据cutFrame对视频进行分割
    const copy = new VideoTrack(this.source, cutFrame)

    copy.offsetL = cutFrame - this.start
    return copy
  }
}
