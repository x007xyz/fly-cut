<script setup lang="ts">
interface Item { label: string, value: string }

defineProps<{
  selected: string
  mode: 'button' | 'text'
  items: Item[]
}>()

const emit = defineEmits({
  'select': (payload: Item) => typeof payload === 'object',
  'update:selected': (value: string) => typeof value === 'string',
})

function onClick(item: Item) {
  emit('select', item)
  emit('update:selected', item.value)
}
</script>

<template>
  <div class="flex h-10 items-stretch" :class="mode">
    <div v-for="item in items" :key="item.value" class="flex-1 flex items-center justify-center cursor-pointer" :class="{ selected: selected === item.value }" @click="onClick(item)">
      {{ item.label }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.button {
  background: #F4F4F7;
  border-radius: 8px;
  padding: 4px;
  & > .selected {
    background: #FFFFFF;
    border-radius: 4px;
  }
}
.text {
  border-bottom: 1px solid #E7E7EA;

  & > div {
    border-bottom: 2px solid transparent;
  }

  & > .selected {
    color: #683CFD;
    border-bottom: 2px solid #683CFD;
    font-weight: 500;
  }
}
</style>
