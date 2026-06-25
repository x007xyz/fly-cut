# fly-cut

## 简介
基于Webcodecs + Vue3实现的Web端剪辑工具 <br/>
如果有用请 🌟 Star 🌟 支持一下哟 🫣 <br/>

## 功能
![](coverImage/map.png)

## 预览
![](coverImage/preview.gif)

## 可选：AI 自动字幕（TwelveLabs Pegasus）

`src/utils/twelvelabs.ts` 是一个**可选、按需启用**的辅助模块，使用 [TwelveLabs](https://twelvelabs.io) 的 Pegasus 视频理解模型，对公开可访问的视频 URL 进行分析并生成带时间戳的字幕，可直接转换为编辑器的文本轨道。

完全可选：只有在传入 API Key 时才会发起网络请求，默认构建与行为均不受影响。

```ts
import { analyzeVideoCaptions, captionsToTextSources } from '@/utils/twelvelabs';
import { TextTrack } from '@/class/TextTrack';

const captions = await analyzeVideoCaptions({
  apiKey: import.meta.env.VITE_TWELVELABS_API_KEY, // 你的 Key
  videoUrl: 'https://example.com/clip.mp4'         // 视频直链
});

for (const { source, startFrame, frameCount } of captionsToTextSources(captions)) {
  const track = new TextTrack(source, startFrame);
  track.frameCount = frameCount;
  track.end = startFrame + frameCount;
  // 像往常一样把 track 加入时间轴
}
```

在 https://twelvelabs.io 免费获取 API Key，提供慷慨的免费额度。

## 参考
- https://github.com/hughfenghen/WebAV 基于 WebCodecs 在浏览器中处理音视频数据；用来处理音视频文件
- https://github.com/Cc-Edit/CcClip 使用Vue3 + ffmpeg实现的Web剪辑工具，本项目主题功能基于本项目开发
