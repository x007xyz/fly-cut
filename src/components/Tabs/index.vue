<template>
  <div class="flex">
    <div v-for="item in items" class="h-8 p-2 flex justify-center items-center cursor-pointer" :key="item.value" :class="{ selected: selected === item.value }" @click="$emit('select', item)">
      {{ item.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    selected: string,
    mode: 'button' | 'text',
    items: { label: string, value: string }[]
  }>();

  defineEmits({
    select: (payload: { label: string, value: string }) => true
  });
</script>

<style scoped>
.selected {
    background: #F4F4F7;
    border-radius: 4px;
  }
</style>