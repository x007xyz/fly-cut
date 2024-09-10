import { describe, expect, it } from 'vitest'
import { checkTrackItemOverlap } from '../trackUtils' // 替换为你的模块路径
import type { BaseTractItem } from '@/class/Base'

describe('checkTrackItemOverlap', () => {
  it('should return no overlap when there are no track items', () => {
    const trackList: BaseTractItem[] = []
    const checkItem: BaseTractItem = { id: '1', start: 10, end: 20 }

    const result = checkTrackItemOverlap(trackList, checkItem)

    expect(result).toEqual({
      hasOverlap: false,
      overLapIndex: -1,
      insertIndex: 0,
    })
  })

  it('should return overlap when new item overlaps with an existing item', () => {
    const trackList: BaseTractItem[] = [
      { id: 1, start: 5, end: 15 },
      { id: 2, start: 20, end: 30 },
    ]
    const checkItem: BaseTractItem = { id: 3, start: 10, end: 25 }

    const result = checkTrackItemOverlap(trackList, checkItem)

    expect(result).toEqual({
      hasOverlap: true,
      overLapIndex: 0,
      insertIndex: 0,
    })
  })

  it('should return correct insertIndex when new item does not overlap and should be inserted in the middle', () => {
    const trackList: BaseTractItem[] = [
      { id: 1, start: 5, end: 15 },
      { id: 2, start: 20, end: 30 },
    ]
    const checkItem: BaseTractItem = { id: 3, start: 15, end: 20 }

    const result = checkTrackItemOverlap(trackList, checkItem)

    expect(result).toEqual({
      hasOverlap: false,
      overLapIndex: -1,
      insertIndex: 1,
    })
  })

  it('should return correct insertIndex when new item does not overlap and should be inserted at the end', () => {
    const trackList: BaseTractItem[] = [
      { id: 1, start: 5, end: 15 },
      { id: 2, start: 20, end: 30 },
    ]
    const checkItem: BaseTractItem = { id: 3, start: 35, end: 40 }

    const result = checkTrackItemOverlap(trackList, checkItem)

    expect(result).toEqual({
      hasOverlap: false,
      overLapIndex: -1,
      insertIndex: 2,
    })
  })

  it('should return no overlap when new item has the same id as an existing item', () => {
    const trackList: BaseTractItem[] = [
      { id: 1, start: 5, end: 15 },
      { id: 2, start: 20, end: 30 },
    ]
    const checkItem: BaseTractItem = { id: 2, start: 10, end: 25 }

    const result = checkTrackItemOverlap(trackList, checkItem)

    expect(result).toEqual({
      hasOverlap: false,
      overLapIndex: -1,
      insertIndex: 0,
    })
  })
})
