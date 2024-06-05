<template>
  <div class="tabsToggle border-r dark:border-gray-600 border-gray-300">
    <div
      v-for="tab in menuData"
      :class="{ toggle: selected === tab.key }"
      @click="$emit('toggle', tab)"
      :key="tab.key"
    >
      <i class="iconfont" :class="tab.icon" />
      <span>{{ tab.title }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { menuData, type MenuItem } from '@/data/baseMenu';
  defineProps<{
    selected: string
  }>();

  defineEmits({
    toggle: (payload: MenuItem) => true // replace with your actual validation logic
  });
</script>

<style scoped lang="scss">
  .tabsToggle {
    width: 80px;
    display: flex;
    flex-direction: column;
    // border-right: 1px solid #e7e7ea;

    div {
      margin: 6px 7px;
      width: 66px;
      height: 58px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      i {
        font-weight: 550;
        font-size: 18px;
      }

      span {
        font-size: 11px;
        font-weight: 500;
        line-height: 18px;
      }
    }

    .toggle {
      background: rgba(0, 0, 0, .3);
      box-shadow: 0 1px 0 0 #0000000d;
      border-radius: 8px;
    }

    .divided {
      border-bottom: 1px solid #e7e7ea;
    }
  }
</style>