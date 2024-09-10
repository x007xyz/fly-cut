<script setup lang="ts">
import { type PropType, watch } from 'vue'
import type { ImageTractItem } from '@/stores/trackState'
import trackCheckPlaying from './trackCheckPlaying'

const props = defineProps({
  trackItem: {
    type: Object as PropType<ImageTractItem>,
    default() {
      return {
        width: '0px',
        left: '0px',
      }
    },
  },
})
// console.log('props', props)
// const store = usePlayerState()
// store.ingLoadingCount++;
async function initImage() {
  // store.ingLoadingCount--;
  // const { name, source, format } = props.trackItem
  // if (name && source) {
  //   const imageName = `${name}.${format}`
  // }
}
watch(() => {
  return props.trackItem.source
}, initImage, {
  immediate: true,
  flush: 'post',
})
trackCheckPlaying(props)
</script>

<template>
  <div class="flex flex-col rounded overflow-hidden h-full">
    <div class="flex items-center text-xs pl-2 overflow-hidden h-6 leading-6 bg-yellow-700 bg-opacity-70 text-gray-300">
      <img :src="trackItem.cover" class="w-4 h-4 inline-block mr-2 shrink-0" alt="" draggable="false">
      <span class="mr-4 shrink-0">{{ trackItem.name }}</span>
    </div>
  </div>
</template>
