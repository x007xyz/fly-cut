import { AudioTrack } from '@/class/AudioTrack';
import type { BaseTractItem } from '@/class/Base';
import { VideoTrack } from '@/class/VideoTrack';
import type { TrackLineItem } from '@/stores/trackState';

/**
 * 检查 checkItem 是否与当前 trackList 存在帧重叠部分
 * */
export function checkTrackItemOverlap(trackList: BaseTractItem[], checkItem: BaseTractItem) {
    const { start: insertStart, end: insertEnd } = checkItem;
    let overLapIndex = -1;
    let insertIndex = 0;
    const hasOverlap = trackList.filter(item => item.id !== checkItem.id).some((trackItem, index) => {
        const { start, end } = trackItem;
        /**
         * 判断是否重叠：
         * 1. 落点在节点内部，重叠:start < insertStart < end || start < insertEnd < end
         * 2. 落点在节点外，但是落点在两边，重叠:start >= insertStart && end <= insertEnd
         */
        if (
            (start < insertStart && insertStart < end) || (start < insertEnd && insertEnd < end) || (start >= insertStart && end <= insertEnd)
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

type TypeGuard<T> = (value: unknown) => value is T;

export function isOfCanPlayType(value: unknown): value is VideoTrack | AudioTrack {
    return value instanceof VideoTrack || value instanceof AudioTrack;
}

export const getCurrentTrackItemList = <T>(trackList: TrackLineItem[], currentFrame: number, isOfType: TypeGuard<T>): T[] => {
    const trackItems: T[] = [];
    trackList.forEach(({ list }) => {
        list.forEach(trackItem => {
            const { start, end } = trackItem;
            if (start <= currentFrame && end >= currentFrame && isOfType(trackItem)) {
                trackItems.push(trackItem);
            }
        });
    });
    return trackItems;
};