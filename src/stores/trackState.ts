import { checkTrackListOverlap } from '@/utils/storeUtil'
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import type { Track, TrackLineItem } from '@/class/Track'

export const useTrackState = defineStore('trackState', () => {
  const dragData = reactive({ // 拖拽数据
    dataInfo: {} as Track,
    dragType: '',
    dragPoint: {
      x: 0,
      y: 0,
    },
    // 吸附辅助线
    fixLines: [] as { position: number, frame: number }[][],
    moveX: 0,
    moveY: 0,
  })
  const moveTrackData = reactive({ // 行内移动
    lineIndex: -1,
    itemIndex: -1,
  })
  // 轨道放大比例
  const trackScale = ref(Number.parseInt(localStorage.trackS || '60'))
  const trackList = reactive<TrackLineItem[]>([])

  // 选中元素坐标
  const selectTrackItem = reactive({
    line: -1,
    index: -1,
  })
  // 选中元素
  const selectResource = computed(() => {
    if (selectTrackItem.line === -1) {
      return null
    }
    return trackList[selectTrackItem.line]?.list[selectTrackItem.index] || null
  })
  // 删除元素
  function removeTrack(lineIndex: number, itemIndex: number) {
    trackList[lineIndex].list.splice(itemIndex, 1)
    if (trackList[lineIndex].list.length === 0 && !trackList[lineIndex].main) {
      trackList.splice(lineIndex, 1)
    }
    if (trackList.length === 1 && trackList[0].list.length === 0) {
      trackList.splice(0, 1)
    }
  }
  function selectTrackById(id: string) {
    trackList.forEach((item, index) => {
      item.list.forEach((trackItem, trackIndex) => {
        if (trackItem.id === id) {
          selectTrackItem.line = index
          selectTrackItem.index = trackIndex
        }
      })
    })
  }
  /**
   * 添加片段逻辑：
   * 输入：新增片段
   * 查询是否存在同类型轨道，且无重叠部分，存在则插入，不存在则新建轨道
   * 没有轨道时，新增轨道插入
   */
  function addTrack(newItem: Track, lineIndex?: number, start?: number) {
    const lines = trackList.filter(line => line.type === newItem.type)

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index]
      const { hasOverlap, insertIndex } = checkTrackListOverlap(line.list, newItem)
      if (!hasOverlap) {
        line.list.splice(insertIndex, 0, newItem)
        selectTrackItem.line = index
        selectTrackItem.index = insertIndex
        return
      }
    }

    if (['audio'].includes(newItem.type)) {
      trackList.push({
        type: newItem.type,
        list: [newItem],
      })
      selectTrackItem.line = 0
      selectTrackItem.index = 0
    }
    else {
      trackList.unshift({
        type: newItem.type,
        list: [newItem],
      })
      selectTrackItem.line = trackList.length - 1
      selectTrackItem.index = 0
    }
  }

  const frameCount = computed(() => {
    return trackList.reduce((res, { list }) => {
      return Math.max(list.reduce((max, track) => Math.max(max, track.end), 0), res)
    }, 0)
  })

  // watchEffect(() => {
  //   localStorage.trackS = trackScale.value;
  // });
  // watchEffect(() => {
  //   localStorage.trackList = JSON.stringify(trackList);
  // });
  return {
    moveTrackData,
    selectTrackItem,
    selectResource,
    trackScale,
    trackList,
    addTrack,
    selectTrackById,
    removeTrack,
    frameCount,
    dragData,
  }
})
