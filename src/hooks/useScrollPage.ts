import { useInfiniteScroll } from '@vueuse/core';
import { ref } from 'vue';

export const useScrollPage = (el, loadMore, options) => {
  const list = ref([]);

  const pageSize = options.pageSize || 10;
  let pageIndex = 1;
  let finished = false;
  let loading = false;

  function search() {
    loadMore({ pageSize, pageIndex }).then(res => {
      if (res.list.length < pageSize) {
        finished = true;
      }
      list.value = (pageIndex === 1 ? [] : list.value).concat(res.list);
      pageIndex++;
      loading = false;
    });
  }

  function refresh() {
    useInfiniteScroll(
      el,
      () => {
        if (loading) return;
        if (finished) return;
        loading = true;
        search();
        // load more
        // list.value.push(...moreData)
      },
      options
    );
    pageIndex = 1;
    finished = false;
    loading = true;
    // 如何再次触发加载，并且不再次触发加载
    search();
  }

  options.immediate && refresh();

  return { list, refresh };
};
