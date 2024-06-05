import { onUnmounted, ref } from 'vue';

let audio: HTMLAudioElement | null = null;

export const useSound = () => {
  const playingUrl = ref('');

  if (!audio) {
    // 创建一个新的 Audio 对象
    audio = new Audio();
  }

  audio.onended = () => {
    console.log('播放结束');
    playingUrl.value = '';
  };

  audio.addEventListener('pause', () => {
    console.log('播放暂停');
    playingUrl.value = '';
  });

  function toggle(src: string) {
    if (playingUrl.value !== src) {
      audio?.pause();
      setTimeout(() => {
        playingUrl.value = src;
        // 设置音频文件的 URL
        audio.src = src;
        audio?.play();
      }, 100);
    } else {
      playingUrl.value = '';
      audio?.pause();
    }
  }

  function stop() {
    playingUrl.value = '';
    audio?.pause();
  }

  onUnmounted(() => {
    playingUrl.value = '';
    audio?.pause();
  });

  return {
    playingUrl,
    toggle,
    stop
  };
};
