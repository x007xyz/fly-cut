import { useTrackState } from '@/stores/trackState'

const store = useTrackState()
export function initHotKey() {
  // 注册全局事件
  window.onkeydown = (event: KeyboardEvent) => {
    // 判断按键是否在输入框中
    const activeElement = document.activeElement
    if (activeElement && (['input', 'textarea'].includes(activeElement.tagName.toLowerCase()) || (activeElement as HTMLElement).isContentEditable)) {
      return
    }
    const { key } = event
    switch (key) {
      case 'Backspace':
        // 删除操作
        if (store.selectTrackItem.line !== -1 && store.selectTrackItem.index !== -1) {
          store.removeTrack(store.selectTrackItem.line, store.selectTrackItem.index)
          store.selectTrackItem.line = -1
          store.selectTrackItem.index = -1
        }
        break
      case 'Enter':
        break
      default:
        break
    }
  }
}
