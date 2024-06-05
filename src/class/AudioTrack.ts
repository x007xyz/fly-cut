import { uniqueId } from 'lodash-es';
import type { BaseTractItem, TrackType } from './Base';
import { UnitFrame2μs } from '@/data/trackConfig';
import { audioDecoder } from '@/utils/webcodecs';
import { OffscreenSprite } from '@webav/av-cliper';

export interface AudioSource {
  id: string,
  url: string,
  name: string,
  format: string,
  duration: number
}

export class AudioTrack implements BaseTractItem {
  id: string;
  type: TrackType = 'audio';
  source: AudioSource;
  name: string;
  format: string;
  frameCount: number;
  start: number;
  end: number;
  offsetL: number;
  offsetR: number;
  constructor(source: AudioSource, curFrame: number) {
    // 设置ID
    this.id = uniqueId();
    // 设置音频信息
    this.source = source;
    // 获取文件名称
    this.name = source.name;
    // 获取文件类型
    this.format = source.format;

    // 获取音频时长，转换为frameCount
    this.frameCount = source.duration * 30;
    this.start = curFrame;
    this.end = this.start + this.frameCount;

    // 设置裁剪信息
    this.offsetL = 0;
    this.offsetR = 0;
  }
  audio: HTMLAudioElement | null = null;
  play(currentFrame: number) {
    if (!this.audio) {
      this.audio = new Audio(this.source.url);
    }
    if (this.audio?.paused) {
      this.audio.currentTime = (currentFrame - this.start - this.offsetL) / 30;
      this.audio.play();
    }
  }
  pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }
  // 生成合成对象
  async combine() {
    const clip = await audioDecoder.decode({ id: this.source.id });
    if (!clip) {
      throw new Error('clip is not ready');
    }
    const spr = new OffscreenSprite(clip);
    // TODO：需要支持裁剪
    spr.time = { offset: this.start * UnitFrame2μs, duration: this.frameCount * UnitFrame2μs };

    return spr;
  }
}