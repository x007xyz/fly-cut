<template>
  <div
    class="mb-1 mt-1 relative ml-2 trackLine"
    :class="[TrackHeightMap.get(lineType), isActive ? 'dark:bg-gray-700 bg-gray-400 bg-opacity-20' : 'bg-gray-200 bg-opacity-10', isMain ? 'bg-blue-500 bg-opacity-20' : '']"
    :data-index="lineIndex"
    :data-type="lineType"
  >
    <template v-for="(item, index) of lineData" :key="item.id">
      <TrackItem
          :lineIndex="lineIndex"
          :itemIndex="index"
          :trackItem="item"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { TrackHeightMap } from '@/data/trackConfig';
  import { useTrackState } from '@/stores/trackState';
  import { computed } from 'vue';
  import TrackItem from '@/components/item/trackItem/TrackItem.vue';
  import { usePlayerState } from '@/stores/playerState';
  const props = defineProps({
    isMain: {
      type: Boolean,
      default: false
    },
    lineType: {
      type: String,
      default: ''
    },
    lineIndex: {
      type: Number,
      default: 0
    },
    lineData: {
      type: Array,
      default() {
        return [];
      }
    }
  });
  const playerStore = usePlayerState();
  const store = useTrackState();
  const isActive = computed(() => {
    return store.selectTrackItem.line === props.lineIndex;
  });
</script>

<style scoped>
  .showLine-t::after{
    content: '';
    display: block;
    position: absolute;
    top: 1px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #FCD34D;
    z-index: 30;
  }
  .showLine-b::before{
    content: '';
    display: block;
    position: absolute;
    bottom: 1px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #FCD34D;
    z-index: 30;
  }
</style>