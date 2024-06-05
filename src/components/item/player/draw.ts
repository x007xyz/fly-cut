import { App, Rect } from 'leafer-ui';
import '@leafer-in/editor';
import '@leafer-in/view';
import { usePlayerState } from '@/stores/playerState';

export default () => {
  const playerStore = usePlayerState();
  const app = new App({
    view: 'player',
    editor: { lockRatio: true, around: 'center', skewable: false },
    tree: { width: 1080, height: 1920, fill: 'rgb(50,205,121)' }
  });

  // const rect = Rect.one({ editable: true, fill: 'rgb(50,205,121)', cornerRadius: 30 }, 100, 100);
  // app.tree.add(rect);

  // app.editor.target = rect;

  watch([() => playerStore.playerHeight, () => playerStore.playerWidth], ([playerHeight, playerWidth]) => {
    app.tree.zoom(1920 / playerHeight);
  });
};