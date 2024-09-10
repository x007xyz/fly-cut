<script setup lang="ts">
defineProps<{
  selected: string
  mode: 'button' | 'text'
  items: { label: string, value: string }[]
}>()

defineEmits({
  select: (payload: { label: string, value: string }) => typeof payload === 'object',
})
</script>

<template>
  <div class="flex">
    <div v-for="item in items" :key="item.value" class="h-8 p-2 flex justify-center items-center cursor-pointer" :class="{ selected: selected === item.value }" @click="$emit('select', item)">
      {{ item.label }}
    </div>
  </div>
</template>

<style scoped>
.selected {
    background: #F4F4F7;
    border-radius: 4px;
  }
</style>
