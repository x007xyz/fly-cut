// import type { AudioTrack } from './AudioTrack'
// import type { ImageTrack } from './ImageTrack'
// import type { TextTrack } from './TextTrack'
// import type { VideoTrack } from './VideoTrack'

import { uniqueId } from 'lodash-es'
import type { MediaResource } from '@/stores/mediaResourceStore'
import type { IClip, OffscreenSprite } from '@webav/av-cliper'

// export type Track = AudioTrack | ImageTrack | TextTrack | VideoTrack

// export interface TrackLineItem {
//   type: Track['type']
//   main?: boolean
//   list: Track[]
// }

type TrackType = 'audio' | 'image' | 'text' | 'video'

// 将Resource的type类型转换为TrackType

function resourceTypeToTrackType(type: MediaResource['type']): TrackType {
  if (type.includes('audio')) {
    return 'audio'
  }
  if (type.includes('image')) {
    return 'image'
  }
  if (type.includes('videos')) {
    return 'video'
  }
  return 'text'
}

export default class Track {
  id: string
  type: TrackType
  start: number
  end: number
  offsetL: number
  offsetR: number
  frameCount: number
  clip: IClip
  sprite: OffscreenSprite
  constructor(resource: MediaResource, options?: { start: number, end: number, offsetL: number, offsetR: number }) {
    this.id = uniqueId()
    this.type = resourceTypeToTrackType(resource.type)
    this.clip = resource.clip as IClip

    // 计算帧数
    this.frameCount = resource.duration * 30
  }

  fromJSON(json: any) {
    this.id = json.id
    this.type = json.type
    this.actions = json.actions
    this.clip = json.clip
    this.sprite = json.sprite
  }
}
