import { reactive, watchEffect } from 'vue';
import { defineStore } from 'pinia';
import { calcTrackItemAttr, computedItemShowArea, getJsonParse, getTextRect } from '@/utils/common';
import { useTrackState, type TrackItem } from './trackState';
import { usePlayerState } from './playerState';
import { get, set } from 'lodash-es';

interface LayerAttr {
    // 左上角顶点坐标
    left: number;
    top: number;
    // 绘制在画板上的宽高
    width: number;
    height: number;
    // 原点坐标
    origin: {
        left: number;
        top: number;
    }
}

export const useTrackAttrState = defineStore('trackAttrState', () => {
    const trackState = useTrackState();

    const playerState = usePlayerState();

    const trackAttrMap = reactive(localStorage.trackAttr ? getJsonParse(localStorage.trackAttr) : {});

    function initTrackAttr(trackItem: TrackItem) {
        // 在初始化时，就绘制图层
        if (!trackAttrMap[trackItem.id]) {
            trackAttrMap[trackItem.id] = {};
            const data = calcTrackItemAttr(trackItem, playerState.canvasOptions, trackAttrMap[trackItem.id]);
            for (let key in data) {
                trackAttrMap[trackItem.id][key] = data[key];
            }
        }
    }

    function setTrackAttr(id: string, data: Record<string, any>) {
        if (!trackAttrMap[id]) {
            trackAttrMap[id] = {};
        }
        for (let key in data) {
            set(trackAttrMap[id], key, data[key]);
        }
        // 在某些属性改动时，重新计算属性
        if ('fontSize' in data || 'text' in data) {
            console.log('触发重新计算属性');
            const rect = getTextRect({ text: trackAttrMap[id].text, fontSize: trackAttrMap[id].fontSize });
            if (rect) {
                console.log('rect', rect);
                trackAttrMap[id].width = rect.width;
                trackAttrMap[id].height = rect.height;
            }
        }
    }

    function deleteTrack(id: string) {
        if (trackAttrMap[id]) {
            delete trackAttrMap[id];
        }
    }
    watchEffect(() => {
        localStorage.trackAttr = JSON.stringify(trackAttrMap);
    });

    const layerAttrMap = computed(() => {
        const { width, height } = playerState.canvasOptions;
        const layerMap: Record<string, LayerAttr> = {};
        for (let id in trackAttrMap) {
            const { centerX, centerY, width: sourceWidth, height: sourceHeight, scale } = trackAttrMap[id];
            const drawWidth = Math.round(sourceWidth * scale / 100);
            const drawHeight = Math.round(sourceHeight * scale / 100);
            layerMap[id] = {
                left: centerX + width / 2 - drawWidth / 2,
                top: -1 * centerY + height / 2 - drawHeight / 2,
                width: drawWidth,
                height: drawHeight,
                origin: { left: (width - sourceWidth) / 2, top: (height - sourceHeight) / 2 }
            };
        }
        return layerMap;
    });

    // 监听画布变化，画板变化时，更新所有图层
    return {
        trackAttrMap,
        initTrackAttr,
        setTrackAttr,
        deleteTrack,
        layerAttrMap
    };
});
