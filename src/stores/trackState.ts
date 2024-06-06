import { ref, reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import { checkTrackListOverlap } from '@/utils/storeUtil';
import type { Track, TrackLineItem } from '@/class/Track';

export const useTrackState = defineStore('trackState', () => {
  const dragData = reactive({ // 拖拽数据
    dataInfo: {} as Track,
    dragType: '',
    dragPoint: {
      x: 0,
      y: 0
    },
    // 吸附辅助线
    fixLines: [] as { position: number, frame: number }[][],
    moveX: 0,
    moveY: 0
  });
  const moveTrackData = reactive({ // 行内移动
    lineIndex: -1,
    itemIndex: -1
  });
  // 轨道放大比例
  const trackScale = ref(parseInt(localStorage.trackS || '60'));
  const trackList = reactive<TrackLineItem[]>([]);

  // 选中元素坐标
  const selectTrackItem = reactive({
    line: -1,
    index: -1
  });
  // 选中元素
  const selectResource = computed(() => {
    if (selectTrackItem.line === -1) {
      return null;
    }
    return trackList[selectTrackItem.line]?.list[selectTrackItem.index] || null;
  });
  // 删除元素
  function removeTrack(lineIndex: number, itemIndex: number) {
    trackList[lineIndex].list.splice(itemIndex, 1);
    if (trackList[lineIndex].list.length === 0 && !trackList[lineIndex].main) {
      trackList.splice(lineIndex, 1);
    }
    if (trackList.length === 1 && trackList[0].list.length === 0) {
      trackList.splice(0, 1);
    }
  }
  // 复用已有行
  // function insertExistingLine(item: TrackItem, insertLine: { line: number, index: number }) {
  //   trackList[insertLine.line].list.splice(insertLine.index, 0, item);
  //   selectTrackItem.line = insertLine.line;
  //   selectTrackItem.index = insertLine.index;
  // }
  // 插入新行
  // function insertNewLine(item: TrackItem) {
  //   const isVA = ['video', 'audio'].includes(item.type);
  //   trackList[isVA ? 'push' : 'unshift']({
  //     type: item.type,
  //     list: [item]
  //   });
  //   selectTrackItem.line = isVA ? trackList.length - 1 : 0;
  //   selectTrackItem.index = 0;
  // }
  // 移动目标行
  // function moveTargetLine(item: TrackItem, insertLine: { line: number, index: number }) {
  //   let { lineIndex: moveLineIndex = -1, itemIndex: moveIndex = -1 } = moveTrackData;
  //   // 将原本的数据设置为undefined，避免在插入时被删除
  //   trackList[moveLineIndex].list.splice(moveIndex, 1, undefined);
  //   // 在插入行设置数据
  //   trackList[insertLine.line].list.splice(insertLine.index, 0, item);
  //   // 遍历删除undefined
  //   trackList[moveLineIndex].list = trackList[moveLineIndex].list.filter(elem => elem);

  //   if (trackList[moveLineIndex].list.length === 0 && !trackList[moveLineIndex].main) {
  //     trackList.splice(moveLineIndex, 1);
  //   }
  // }
  // 目标行不可用，则移动到目标之后、之前
  // function moveLine(item: TrackItem, targetLineIndex: number) {
  //   let { lineIndex: moveLineIndex = -1, itemIndex: moveIndex = -1 } = moveTrackData;
  //   trackList.splice(targetLineIndex, 0, {
  //     type: item.type,
  //     list: [item]
  //   });
  //   if (moveLineIndex !== -1 && moveIndex !== -1) { // 移动到新行，删除老数据
  //     if (targetLineIndex <= moveLineIndex) {
  //       moveLineIndex++; // 如果在移除元素前面插入，则移除下标自增
  //     }
  //     if (trackList[moveLineIndex].list.length === 1 && targetLineIndex > moveLineIndex) {
  //       targetLineIndex--; // 如果在移除元素前面插入，选中元素列上移
  //     }
  //     removeTrack(moveLineIndex, moveIndex, false);
  //   }
  //   selectTrackItem.line = targetLineIndex;
  //   selectTrackItem.index = 0;
  // }
  function selectTrackById(id: string) {
    trackList.forEach((item, index) => {
        item.list.forEach((trackItem, trackIndex) => {
          if (trackItem.id === id) {
            selectTrackItem.line = index;
            selectTrackItem.index = trackIndex;
          }
        });
    });
  }
  /**
   * 添加片段逻辑：
   * 输入：新增片段
   * 查询是否存在同类型轨道，且无重叠部分，存在则插入，不存在则新建轨道
   * 没有轨道时，新增轨道插入
   */
  function addTrack(newItem: Track) {
    const lines = trackList.filter(line => line.type === newItem.type);

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const { hasOverlap, insertIndex } = checkTrackListOverlap(line.list, newItem);
      if (!hasOverlap) {
        line.list.splice(insertIndex, 0, newItem);
        selectTrackItem.line = index;
        selectTrackItem.index = insertIndex;
        return;
      }
    }

    if (['audio'].includes(newItem.type)) {
      trackList.push({
        type: newItem.type,
        list: [newItem]
      });
      selectTrackItem.line = 0;
      selectTrackItem.index = 0;
    } else {
      trackList.unshift({
        type: newItem.type,
        list: [newItem]
      });
      selectTrackItem.line = trackList.length - 1;
      selectTrackItem.index = 0;
    }
  }

  const frameCount = computed(() => {
    return trackList.reduce((res, { list }) => {
      return Math.max(list.reduce((max, track) => Math.max(max, track.end), 0), res);
    }, 0);
  });

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
    dragData
  };
});
