interface MenuItem {
  title: string,
  key: string,
  active?: boolean,
  icon: string
}
const menuData: MenuItem[] = [
  { title: '图片', key: 'image', icon: 'icon-tupian_line' },
  { title: '视频', key: 'video', icon: 'icon-shipin_line' },
  { title: '音频', key: 'audio', icon: 'icon-yinle_line' },
  { title: '文字', key: 'text', icon: 'icon-wenzi_line' }
];

export { menuData };
export type { MenuItem };