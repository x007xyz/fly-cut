import * as opfs from 'opfs-tools'

/**
 * 将资源写入OPFS
 * @param id
 * @param extension
 * @param fileBuffer
 * @returns
 */
export async function writeResourceToOPFS(id: string, extension: string, fileBuffer: ArrayBuffer) {
  const fileName = `/${id}/resource.${extension}`
  if (!(await opfs.file(fileName).exists())) {
    await opfs.write(fileName, fileBuffer)
  }
  return fileName
}
/**
 * 获取文件
 * @param id
 * @param extension
 * @returns
 */
export async function getFileById(id: string, extension?: string) {
  if (extension) {
    return opfs.file(`/${id}/resource.${extension}`)
  }
  // 如果extension为空，则查找文件下所有资源
  const files = await opfs.dir(`/${id}`).children()

  for (const file of files) {
    if (file.kind === 'file' && file.name.includes(`resource`)) {
      return file
    }
  }

  throw new Error('Resource not found')
}
