import type { Track } from '@/class/Track';

/**
 * 检查 checkItem 是否与当前 trackList 存在帧重叠部分
 * */
export function checkTrackListOverlap(trackList: Track[], checkItem: Track, moveIndex = -1) {
    const { start: insertStart, end: insertEnd } = checkItem;
    let overLapIndex = -1;
    let insertIndex = 0;
    const hasOverlap = trackList.some((trackItem, index) => {
        if (moveIndex !== -1 && index === moveIndex) { // 行内移动情况下忽略掉移动元素
            return false;
        }
        const { start, end } = trackItem;
        // 当前列表中元素 开始帧处于新元素内部，或结束帧处于新元素内部，则视为重叠
        if (
            (start <= insertStart && end >= insertEnd) // 添加节点的开始和结束位置位于老节点外 或 两端相等
            || (start >= insertStart && start < insertEnd) // 老节点开始位置在添加节点内部
            || (end > insertStart && end <= insertEnd) // 老节点结束位置在添加节点内部
        ) {
            overLapIndex = index;
            return true;
        } else {
            if (end <= insertStart) {
                insertIndex = index + 1;
            }
            return false;
        }
    });
    return {
        hasOverlap,
        overLapIndex,
        insertIndex
    };
}
