export type TrackType = 'video' | 'audio' | 'text' | 'image' | 'effect' | 'transition' | 'filter'

export interface BaseTractItem {
  id: string
  type: TrackType
  name: string
  start: number // 在轨道上的起始位置，单位为帧
  end: number // 在轨道上的结束位置
  frameCount: number // 总帧数
}

export async function getMD5(arrayBuffer: ArrayBuffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// 文本、音频、视频、图片
/**
 * 针对网络资源，需要服务端提供文件信息：
 * id, 资源地址、文件名、文件类型、文件尺寸（视频、图片）、文件时长（视频、音频）
 * 本地可以获取这些信息，但是服务端提供从流程上来说更合理，拿到这些信息，就可以马上渲染时间轴了
 */
