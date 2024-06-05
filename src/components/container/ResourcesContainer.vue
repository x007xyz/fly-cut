<template>
  <div class="flex h-full overflow-hidden relative">
    <MenuList :selected="selected.key" @toggle="onChangeSelect" />
    <ItemList
      :activeKey="selected.key"
      :defaultCollapse="store.hideSubMenu"
      :title="selected.title"
      @collapseChange="changeCollapse"
    />
  </div>
</template>

<script setup lang="ts">
  import MenuList from '@/components/MenuList.vue';
  import ItemList from '@/components/ItemList.vue';
  import { menuData, type MenuItem } from '@/data/baseMenu';
  import { ref, reactive, nextTick } from 'vue';
  import { usePageState } from '@/stores/pageState';

  const store = usePageState();
  function changeCollapse(newCollpase: boolean) {
    nextTick(() => {
      store.hideSubMenu = newCollpase;
    });
  }

  const selected = ref<MenuItem>(menuData[0]);

  function onChangeSelect(item: MenuItem) {
    selected.value = item;
    if (store.hideSubMenu) {
      store.hideSubMenu = false;
    }
  }
</script>
