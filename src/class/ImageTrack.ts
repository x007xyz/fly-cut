import { UnitFrame2μs } from '@/data/trackConfig'
import { imageDecoder } from '@/utils/webcodecs'
import { ImgClip, OffscreenSprite } from '@webav/av-cliper'
import { uniqueId } from 'lodash-es'
import type { BaseTractItem, TrackType } from './Base'

export interface ImageSource {
  id: string
  url: string
  name: string
  format: string
  width: number
  height: number
}
/**
 * 解析文件不能放在片段中：
 * 1. 文件解析是一个耗时操作，需要提前解析好，然后传递给片段
 * 2. 文件可能是网络资源，也可能是本地资源，在片段对象中要收束
 * 3. 不同片段可能共享同一个文件，解析一次即可
 * 4. 片段信息需要转换为文本进行存储（草稿）
 */
export class ImageTrack implements BaseTractItem {
  id: string
  type: TrackType = 'image'
  source: ImageSource
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
  get drawHeight() {
    return this.height * this.scale / 100
  }

  get drawWidth() {
    return this.width * this.scale / 100
  }

  constructor(source: ImageSource, curFrame: number) {
    // 设置ID
    this.id = uniqueId()
    // 设置图片信息
    this.source = source
    // 获取文件名称
    this.name = source.name
    // 获取文件类型
    this.format = source.format
    // 设置轨道信息
    this.frameCount = 30 * 60
    this.start = curFrame
    this.end = this.start + this.frameCount

    // 设置绘制信息
    this.centerX = 0
    this.centerY = 0
    this.scale = 100
    this.height = source.height
    this.width = source.width
  }

  getDrawX(width: number) {
    return width / 2 - this.drawWidth / 2 + this.centerX
  }

  getDrawY(height: number) {
    return height / 2 - this.drawHeight / 2 + this.centerY
  }

  draw(ctx: CanvasRenderingContext2D, { width, height }: { width: number, height: number }, frameIndex: number) {
    const frame = Math.max(frameIndex - this.start, 0) // 默认展示首帧
    return imageDecoder.getFrame(this.source.format, this.source.id, frame).then((vf) => {
      if (vf) {
        ctx.drawImage(vf, 0, 0, this.source.width, this.source.height, this.getDrawX(width), this.getDrawY(height), this.drawWidth, this.drawHeight)
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

  // 生成合成对象
  async combine(playerSize: { width: number, height: number }, outputRatio: number) {
    const frames = await imageDecoder.decode({ id: this.source.id })
    if (!frames) {
      throw new Error('frames is not ready')
    }
    const clip = new ImgClip(frames)
    const spr = new OffscreenSprite(clip)
    // TODO：需要支持裁剪
    spr.time = { offset: this.start * UnitFrame2μs, duration: this.frameCount * UnitFrame2μs }
    spr.rect.x = this.getDrawX(playerSize.width) * outputRatio
    spr.rect.y = this.getDrawY(playerSize.height) * outputRatio
    spr.rect.w = this.drawWidth * outputRatio
    spr.rect.h = this.drawHeight * outputRatio

    return spr
  }
}
