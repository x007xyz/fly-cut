import { UnitFrame2μs } from '@/data/trackConfig'
import { getTextRect } from '@/utils/common'
import { ImgClip, OffscreenSprite } from '@webav/av-cliper'
import { uniqueId } from 'lodash-es'
import type { BaseTractItem, TrackType } from './Base'

export interface TextSource {
  content: string
  fill: string
  stroke?: string
  fontSize: number
  fontFamily: string
  textBackgroundColor?: string
  name: string
}

export class TextTrack implements BaseTractItem {
  source: TextSource
  // 文本内容
  fill: string
  stroke?: string
  textBackgroundColor?: string
  // 影响文本绘制的属性都使用getter/setter，在设置时，需要重新计算文本宽高
  #fontSize = 24
  get fontSize() {
    return this.#fontSize
  }

  set fontSize(value: number) {
    this.#fontSize = value
    // 绘制文本时，需要重新计算文本宽高
    this.calcSize()
  }

  #fontFamily = 'Arial'
  get fontFamily() {
    return this.#fontFamily
  }

  set fontFamily(value: string) {
    this.#fontFamily = value
    // 绘制文本时，需要重新计算文本宽高
    this.calcSize()
  }

  #content = ''
  get content() {
    return this.#content
  }

  set content(value: string) {
    this.#content = value
    // 绘制文本时，需要重新计算文本宽高
    this.calcSize()
  }

  constructor(source: TextSource, curFrame: number) {
    // 设置ID
    this.id = uniqueId()

    this.source = source
    // 设置文字信息
    this.#content = source.content
    this.fill = source.fill
    this.stroke = source.stroke
    this.textBackgroundColor = source.textBackgroundColor
    this.#fontSize = source.fontSize
    this.#fontFamily = source.fontFamily
    this.name = source.name
    // 对于文本意义不大
    this.format = 'text'
    // 设置轨道信息
    this.frameCount = 30 * 60
    this.start = curFrame
    this.end = this.start + this.frameCount
    // 设置绘制信息
    this.centerX = 0
    this.centerY = 0
    this.scale = 100

    this.calcSize()
  }

  calcSize() {
    const { width, height } = getTextRect({ text: this.#content, fontSize: this.#fontSize, fontFamily: this.#fontFamily })
    // 计算文本宽高
    this.height = height
    this.width = width
  }

  get drawWidth() {
    return this.width * this.scale / 100
  }

  get drawHeight() {
    return this.height * this.scale / 100
  }

  type: TrackType = 'text'
  centerX = 0
  centerY = 0
  scale = 100
  width = 0
  height = 0
  getDrawX(width: number) {
    return width / 2 - this.drawWidth / 2 + this.centerX
  }

  getDrawY(height: number) {
    return height / 2 - this.drawHeight / 2 + this.centerY
  }

  drawRoundRect(ctx: OffscreenCanvasRenderingContext2D, { x, y, width, height, radius, color }: { x: number, y: number, width: number, height: number, radius: number, color: string }) {
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + width, y, x + width, y + height, radius)
    ctx.arcTo(x + width, y + height, x, y + height, radius)
    ctx.arcTo(x, y + height, x, y, radius)
    ctx.arcTo(x, y, x + width, y, radius)
    ctx.closePath()
    ctx.fill()
  }

  // 渲染方法保持一致
  draw(ctx: OffscreenCanvasRenderingContext2D, { width, height }: { width: number, height: number }) {
    const padding = 4
    const radius = 4
    const text = this.content
    const drawL = this.getDrawX(width)
    const drawT = this.getDrawY(height)
    const size = this.fontSize * this.scale / 100
    const color = this.fill
    const fontFamily = this.fontFamily
    const strokeColor = this.stroke
    const strokeWidth = 4
    const backgroundColor = this.textBackgroundColor

    const lines = text.split('\n')
    const lineHeight = size * 1.2 // Adjust line height as needed

    // Measure the widest line
    const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width))

    const totalHeight = lines.length * lineHeight

    if (backgroundColor) {
      this.drawRoundRect(ctx, {
        x: drawL - padding,
        y: drawT - padding,
        width: textWidth + padding * 2,
        height: totalHeight + padding * 2,
        radius,
        color: backgroundColor,
      })
    }

    ctx.textBaseline = 'top'
    ctx.font = `${size}px ${fontFamily}`

    const startY = drawT + (totalHeight - lines.length * size) / 2 // Adjust y to center text vertically

    lines.forEach((line, index) => {
      const y = startY + index * lineHeight

      if (strokeColor && strokeWidth) {
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = strokeWidth
        ctx.strokeText(line, drawL, y)
      }

      ctx.fillStyle = color
      ctx.fillText(line, drawL, y)
    })

    return Promise.resolve()
  }

  id: string
  name: string
  frameCount: number
  start: number
  end: number
  format: string
  // 生成合成对象
  async combine(playerSize: { width: number, height: number }, outputRatio: number) {
    const canvas = new OffscreenCanvas(this.drawWidth, this.drawHeight)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('ctx is null')
    }
    this.draw(ctx, { width: this.drawWidth, height: this.drawHeight }, 0)
    const clip = new ImgClip(await createImageBitmap(canvas))

    await clip.ready
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
