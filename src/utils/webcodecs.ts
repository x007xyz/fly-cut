import { baseFps, UnitFrame2μs } from '@/data/trackConfig'
import { AudioClip, Combinator, decodeImg, MP4Clip, OffscreenSprite } from '@webav/av-cliper'
import { file, write } from 'opfs-tools'
import type { VideoSource } from '@/class/VideoTrack'

async function writeFile(id: string, stream?: ReadableStream<Uint8Array>) {
  if (!stream) {
    // 没有数据流，尝试从opfs中获取
    stream = await file(id).stream()

    if (!stream) {
      throw new Error('stream is not ready')
    }
  }

  const start = performance.now()

  // 如果opfs中没有数据则存储
  if (!(await file(id).exists())) {
    await write(id, stream)
    console.log('opfs存储文件耗时', performance.now() - start, 'ms')

    stream = await file(id).stream()

    console.log('opfs读取文件耗时', performance.now() - start, 'ms')
  }

  return stream
}

class VideoDecoder {
  #decoderMap = new Map<string, MP4Clip>()

  #thumbnailsMap = new Map<string, {
    img: Blob
    ts: number
  }[]>()

  async thumbnails(source: VideoSource) {
    if (this.#thumbnailsMap.has(source.id)) {
      return this.#thumbnailsMap.get(source.id)
    }
    const clip = await this.decode({ id: source.id })

    if (!clip) {
      throw new Error('clip is not ready')
    }
    const thumbnails = await clip.thumbnails(50, { step: 1e6 })

    this.#thumbnailsMap.set(source.id, thumbnails)

    return thumbnails
  }

  async decode({ id, stream, type }: { id: string, stream?: ReadableStream<Uint8Array>, type?: string }) {
    if (this.#decoderMap.has(id)) {
      return this.#decoderMap.get(id)
    }

    stream = await writeFile(id, stream)

    const videoClip = new MP4Clip(stream)

    await videoClip.ready

    this.#decoderMap.set(id, videoClip)

    return videoClip
  }

  async getFrame(url: string, frameIndex: number) {
    let clip = this.#decoderMap.get(url)
    if (!clip) {
      clip = await this.decode({ url })
    }

    // tick根据时间获取帧，可能存在这一时间帧为空的情况，修改为在范围内寻找帧
    // 前几帧可能为空，所以限定最小时间为5/30秒
    const time = Math.max(((frameIndex - 1) / baseFps * 1e6), 5 / 30 * 1e6)
    let video: VideoFrame | undefined
    const frame = (await (clip as MP4Clip).tick(time))

    return frame.video
  }
}

class ImageDecoder {
  #decoderMap = new Map<string, VideoFrame[]>()
  async decode({ id, stream, type }: { id: string, stream?: ReadableStream<Uint8Array>, type?: string }) {
    console.log('🚀 ~ ImageDecoder ~ decode ~ id:', id)

    if (this.#decoderMap.has(id)) {
      return this.#decoderMap.get(id)
    }

    stream = await writeFile(id, stream)

    if (!type) {
      throw new Error('type is not ready')
    }

    // 接收的数据可能是远程数据（URL），也可能是本地数据（file）
    // 如果是远程数据，可以直接使用URL作为source，
    // 如果是本地数据，可以使用FileReader读取数据，然后使用URL.createObjectURL创建URL作为source，但是这样缓存数据没法还原为File对象
    // 要解决这个问题，可以引入https://hughfenghen.github.io/posts/2024/03/14/web-storage-and-opfs/
    // 但是这样会增加复杂度，所以暂时不考虑，
    // TODO: 使用OPFS解决本地数据问题
    const frames = await decodeImg(
      stream,
      type,
    )

    // 存储解析后的帧
    this.#decoderMap.set(id, frames)

    return frames
  }

  async getFrame(type: string, url: string, frameIndex: number) {
    let frames = this.#decoderMap.get(url)
    if (!frames) {
      await this.decode({ url, type })
      frames = this.#decoderMap.get(url)
    }
    return frames?.[frameIndex % frames.length]
  }
}

class AudioDecoder {
  #decoderMap = new Map<string, AudioClip>()
  async decode({ id, stream, type }: { id: string, stream?: ReadableStream<Uint8Array>, type?: string }) {
    if (this.#decoderMap.has(id)) {
      return this.#decoderMap.get(id)
    }

    stream = await writeFile(id, stream)

    if (!type) {
      throw new Error('type is not ready')
    }

    const clip = new AudioClip(stream)

    if (!clip) {
      // 提示解析视频失败
      throw new Error('解析视频失败')
    }

    await clip.ready

    this.#decoderMap.set(id, clip)

    return clip
  }
}

export async function splitClip(source: IClip, { offsetL, offsetR, frameCount }: { offsetL: number, offsetR: number, frameCount: number }) {
  if (offsetL === 0 && offsetR === 0) {
    return source
  }
  const start = offsetL * UnitFrame2μs
  // 使用start裁剪视频
  const clip = offsetL === 0 ? source : (await source.split(start))[1]
  const end = (frameCount - offsetR - offsetL) * UnitFrame2μs
  return offsetR === 0 ? clip : (await clip.split(end))[0]
}

export const videoDecoder = new VideoDecoder()

export const imageDecoder = new ImageDecoder()

export const audioDecoder = new AudioDecoder()
