type BufferSource = ArrayBuffer | ArrayBufferView

interface FileSystemWritableFileStream {
  write: (data: string | BufferSource | Blob) => Promise<void>
  close: () => Promise<void>
}

interface FileSystemFileHandle {
  createWritable: () => Promise<FileSystemWritableFileStream>
}

interface FilePickerAcceptType {
  description?: string
  accept: Record<string, string[]>
}

interface SaveFilePickerOptions {
  types?: FilePickerAcceptType[]
  excludeAcceptAllOption?: boolean
  suggestedName?: string
}

interface Window {
  showSaveFilePicker: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>
}
