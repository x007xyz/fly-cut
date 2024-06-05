import { ref, toRefs, reactive } from 'vue';
import { defineStore } from 'pinia';

export const usePlayerState = defineStore('playerState', () => {
  const ingLoadingCount = ref(0);
  // 画板信息
  const canvasOptions = reactive({
    width: 0,
    height: 0
  });
  // 要播放的总帧数
  const playerConfig = reactive({
    frameCount: 0,
    playerWidth: 1080 / 6,
    playerHeight: 1920 / 6
  });
  const existVideo = ref(false);
  const playStartFrame = ref(0); // 当前播放帧
  const playTargetTrackMap = ref(new Map()); // 当前播放的元素集合
  const isPause = ref(true);

  return {
    isPause,
    playStartFrame,
    ingLoadingCount,
    playTargetTrackMap,
    existVideo,
    ...toRefs(playerConfig),
    canvasOptions
  };
});
