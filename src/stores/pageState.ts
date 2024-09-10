import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

export const usePageState = defineStore('pageState', () => {
  const pageTitle = ref('视频编辑（CcClip）')
  // 暗色模式
  const isDark = ref(Boolean(localStorage.theme) || true)
  console.log('🚀 ~ usePageState ~ isDark:', isDark)
  const isLoading = ref(localStorage.loadingPage === '1')
  const hideSubMenu = ref(localStorage.showSubmenu === '0')
  watchEffect(() => {
    console.log(`switch to ${isDark.value ? 'dark' : 'light'}`)
    localStorage.theme = isDark.value ? 'true' : 'false'
    localStorage.loadingPage = isLoading.value ? '1' : '0'
    localStorage.hideSubMenu = hideSubMenu.value ? '1' : '0'
    document.documentElement.classList[isDark.value ? 'add' : 'remove']('dark')
  })

  // 属性宽度
  const attrWidth = ref(Number.parseInt(localStorage.attrW || '320'))
  // 轨道高度
  const trackHeight = ref(Number.parseInt(localStorage.trackH || '380'))
  watchEffect(() => {
    localStorage.attrW = attrWidth.value
    localStorage.trackH = trackHeight.value
  })

  return {
    hideSubMenu,
    isLoading,
    pageTitle,
    isDark,
    attrWidth,
    trackHeight,
  }
})
