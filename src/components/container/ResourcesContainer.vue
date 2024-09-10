<script setup lang="ts">
import ItemList from '@/components/ItemList.vue'
import MenuList from '@/components/MenuList.vue'
import { menuData, type MenuItem } from '@/data/baseMenu'
import { usePageState } from '@/stores/pageState'
import { nextTick, ref } from 'vue'

const store = usePageState()
function changeCollapse(newCollpase: boolean) {
  nextTick(() => {
    store.hideSubMenu = newCollpase
  })
}

const selected = ref<MenuItem>(menuData[0])

function onChangeSelect(item: MenuItem) {
  selected.value = item
  if (store.hideSubMenu) {
    store.hideSubMenu = false
  }
}
</script>

<template>
  <div class="flex h-full overflow-hidden relative">
    <MenuList :selected="selected.key" @toggle="onChangeSelect" />
    <ItemList
      :active-key="selected.key"
      :default-collapse="store.hideSubMenu"
      :title="selected.title"
      @collapse-change="changeCollapse"
    />
  </div>
</template>
