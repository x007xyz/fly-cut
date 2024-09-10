<script setup lang="ts">
import TrackContro from '@/components/item/trackItem/TrackContro.vue'
import SplitLine from '@/components/SplitLine.vue'
import TrackList from '@/components/TrackList.vue'
import { usePageState } from '@/stores/pageState'
import { useTrackState } from '@/stores/trackState'
import { computed, reactive } from 'vue'

const page = usePageState()
const store = useTrackState()
const trackHeight = computed(() => ({
  height: `${page.trackHeight}px`,
}))
const limitSize = reactive({
  minHeight: 200,
  maxHeight: document.body.getBoundingClientRect().height - 200,
})
</script>

<template>
  <div
    class="overflow-hidden select-none relative pt-2 flex flex-col"
    :style="trackHeight"
  >
    <SplitLine
      v-model:new-height="page.trackHeight"
      class="top-0 left-0 right-0"
      direction="horizontal"
      :limit-size="limitSize"
    />
    <TrackContro
      v-model="store.trackScale"
    />
    <TrackList />
  </div>
</template>
