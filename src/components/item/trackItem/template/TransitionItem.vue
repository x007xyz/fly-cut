<script setup lang="ts">
import type { TransitionTractItem } from '@/stores/trackState'
import type { PropType } from 'vue'
import trackCheckPlaying from './trackCheckPlaying'

const props = defineProps({
  trackItem: {
    type: Object as PropType<TransitionTractItem>,
    default() {
      return {
        width: '0px',
        left: '0px',
      }
    },
  },
})
trackCheckPlaying(props)
</script>

<template>
  <div class="flex flex-col rounded overflow-hidden h-full">
    <div class="flex items-center text-xs pl-2 overflow-hidden h-6 leading-6 bg-green-700 bg-opacity-70 text-gray-300">
      <TransitionIcon class="inline-block mr-2 shrink-0" />
      <span class="mr-4 shrink-0">{{ props.trackItem.name }}</span>
    </div>
  </div>
</template>
