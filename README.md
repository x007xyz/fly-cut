# fly-cut

## Introduction
A web-based editing tool implemented with Webcodecs + Vue3 <br/>
If you find it useful, please 🌟 Star 🌟 to support it 🫣 <br/>

## Features
![](coverImage/map.png)

## Preview
![](coverImage/preview.gif)

## Optional: AI auto-captions (TwelveLabs Pegasus)

An optional, opt-in helper that uses the [TwelveLabs](https://twelvelabs.io) Pegasus
video-understanding model to analyze a publicly reachable video URL and generate
timestamped captions, which can be turned into editor text tracks.

It is fully opt-in: no network request is made unless you pass an API key, and the
default build/behavior is unchanged.

```ts
import { analyzeVideoCaptions, captionsToTextSources } from '@/utils/twelvelabs';
import { TextTrack } from '@/class/TextTrack';

const captions = await analyzeVideoCaptions({
  apiKey: import.meta.env.VITE_TWELVELABS_API_KEY, // your key
  videoUrl: 'https://example.com/clip.mp4'         // direct media link
});

for (const { source, startFrame, frameCount } of captionsToTextSources(captions)) {
  const track = new TextTrack(source, startFrame);
  track.frameCount = frameCount;
  track.end = startFrame + frameCount;
  // add `track` to your timeline as usual
}
```

Get a free API key at https://twelvelabs.io — there is a generous free tier.

## References
- https://github.com/hughfenghen/WebAV Processes audio and video data in the browser based on WebCodecs; used for processing audio and video files
- https://github.com/Cc-Edit/CcClip A web-based editing tool implemented with Vue3 + ffmpeg, the main functionality of this project is based on this project