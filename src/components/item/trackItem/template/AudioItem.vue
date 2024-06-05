<template>
  <div class="flex flex-col rounded overflow-hidden h-full">
    <div class="flex items-center text-xs pl-2 overflow-hidden h-5 leading-5 bg-blue-500 bg-opacity-50 text-gray-100">
      <AudioIcon class="inline-block mr-2 shrink-0" />
      <span class="mr-4 shrink-0">{{ `${trackItem.name}.${trackItem.format}` }}</span>
    </div>
    <div class="overflow-hidden bg-blue-900 bg-opacity-60 flex-1 relative">
      <div :style="waveStyle" class="absolute" ref="waveRef" />
    </div>
    <Loading v-show="loading" class="pl-12 bg-opacity-70" />
  </div>
</template>

<script setup lang="ts">
  import Loading from '@/components/Loading.vue';
  import { computed, inject, ref, watch, PropType } from 'vue';
  import { usePlayerState } from '@/stores/playerState';
  import trackCheckPlaying from './trackCheckPlaying';
  import { AudioTractItem } from '@/stores/trackState';
  import WaveSurfer from 'wavesurfer.js';
  import { WaveOptions } from '@/data/trackConfig';

  const props = defineProps({
    trackItem: {
      type: Object as PropType<AudioTractItem>,
      default() {
        return {
          showWidth: '0px',
          showLeft: '0px'
        };
      }
    }
  });

  const store = usePlayerState();
  store.ingLoadingCount++;
  const waveStyle = computed(() => {
    const { start, end, offsetL, offsetR, frameCount } = props.trackItem;
    const showFrameCount = end - start;
    return {
      transform: `scaleX(${(frameCount / showFrameCount).toFixed(2)})`,
      transformOrigin: 'left top',
      left: `-${offsetL / showFrameCount * 100}%`,
      right: `-${offsetR / showFrameCount * 100}%`
    };
  });
  const loading = ref(true);
  const waveRef = ref();
  async function initAudio() {
    WaveSurfer.create({ container: waveRef.value, url: props.trackItem.source.url, ...WaveOptions });
    loading.value = false;
    store.ingLoadingCount--;
  }

  watch(() => {
    return props.trackItem.source && waveRef.value;
  }, () => {
    waveRef.value && initAudio();
  }, {
    immediate: true
  });
  trackCheckPlaying(props);
</script>