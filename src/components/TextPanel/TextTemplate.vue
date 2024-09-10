<script lang="ts" setup>
import { templateList } from './templateList'

defineEmits({
  addText: (item: any) => typeof item === 'object',
})

function calcStyle(item: { fill: string, stroke?: string, textBackgroundColor?: string }) {
  const style = { color: item.fill }
  const strokeWidth = 2
  const strokeColor = item.stroke
  if (strokeColor) {
    style.textShadow = `-${strokeWidth}px -${strokeWidth}px ${strokeColor}, ${strokeWidth}px -${strokeWidth}px ${strokeColor}, -${strokeWidth}px ${strokeWidth}px ${strokeColor}, ${strokeWidth}px ${strokeWidth}px ${strokeColor}`
    // style.textStroke = `${strokeWidth}px ${strokeColor}`;
  }
  const backgroundColor = item.textBackgroundColor
  if (backgroundColor) {
    style.backgroundColor = backgroundColor
  }
  return style
}

// const style = computed(() => {
//   const strokeWidth = 2
//   const strokeColor = 'red'
//   return {
//     textShadow: `-${strokeWidth}px -${strokeWidth}px red, ${strokeWidth}px -${strokeWidth}px red, -${strokeWidth}px ${strokeWidth}px red, ${strokeWidth}px ${strokeWidth}px ${strokeColor}`,
//   }
// })
</script>

<template>
  <ul class="textList">
    <li v-for="(item, index) in templateList" :key="index" @click="$emit('addText', item)">
      <!-- <img :src="item" crossorigin="anonymous" alt=""> -->
      <span class="text" :style="calcStyle(item)">花字</span>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
  .text {
    display: inline-block;
    font-size: 32px;
    border-radius: 8px;
    padding: 8px;
    line-height: 1;
    font-weight: 800;
  }
  .textList {
    display: flex;
    flex-wrap: wrap;

    li {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      width: 105px;
      height: 105px;
      background: #f4f4f7;
      border-radius: 4px;
      text-align: center;
      // line-height: 105px;
      font-weight: 500;
      font-size: 16px;
      margin-right: 8px;
      margin-bottom: 8px;
      cursor: pointer;

      img {
        width: 74px;
        height: 44px;
        object-fit: contain;
        transition: 0.5s;
      }

      &:hover::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        z-index: 999;
        border-radius: 4px;
        display: block;
        width: 100%;
        height: 100%;
        border: 1.5px solid #683cfd;
      }
    }

    li:nth-child(3n) {
      margin-right: 0;
    }
  }
</style>
