import { AudioClip, ImgClip, MP4Clip } from '@webav/av-cliper'
import type { IClip } from '@webav/av-cliper'

export default async function createClip(stream: ReadableStream<Uint8Array>, type: string) {
  let clip: IClip | null = null
  if (type.includes('audio')) {
    clip = new AudioClip(stream)
  }
  else if (type.includes('image')) {
    clip = new ImgClip(stream)
  }
  else if (type.includes('video')) {
    clip = new MP4Clip(stream)
  }

  if (!clip) {
    throw new Error('无法创建clip')
  }

  await clip.ready

  return clip
}
