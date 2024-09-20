import createClip from './createClip'
import { getFileById } from './fileManager'

// 链接资源，根据id获取从OPFS中获取文件资源，然后根据文件类型，创建Clip对象
export async function connectResource(id: string, type: string) {
  // 1. 根据id从OPFS中获取文件资源
  const fileOPFS = await getFileById(id)

  const clip = await createClip(await fileOPFS.stream(), type)

  return clip
}
