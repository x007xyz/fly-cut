import { baseFps } from '@/data/trackConfig';
import type { TextSource } from '@/class/TextTrack';

/**
 * TwelveLabs Pegasus 集成（可选）。
 *
 * 通过 Pegasus 视频理解模型，对一段公开可访问的视频 URL 做内容分析，
 * 自动生成带时间戳的字幕/分镜文案，再转换成编辑器文本轨道所需的源数据。
 *
 * 这是一个完全可选的功能：只有在调用方显式传入 apiKey 时才会发起网络请求，
 * 默认行为、默认依赖、默认打包产物都不受影响。
 *
 * 说明：本模块只做「分析 + 解析 + 帧换算」，刻意不直接 import TextTrack 类，
 * 以免把渲染层（@webav/av-cliper）的副作用引入纯逻辑，便于单测。
 * 调用方拿到 TextCaptionSource 后，自行 `new TextTrack(source, startFrame)` 即可。
 *
 * 免费 API Key：https://twelvelabs.io
 */

const TWELVELABS_API_BASE = 'https://api.twelvelabs.io/v1.3';

/** 单条带时间戳的字幕片段，时间单位为秒。 */
export interface CaptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface AnalyzeVideoCaptionsOptions {
  /** TwelveLabs API Key，从 https://twelvelabs.io 免费获取。 */
  apiKey: string;
  /** 公开可访问的视频直链（非 YouTube/网盘分享链接）。 */
  videoUrl: string;
  /** 自定义提示词；默认生成简短的逐段口播字幕。 */
  prompt?: string;
  /** Pegasus 模型版本，默认 pegasus1.5。 */
  modelName?: string;
  /** 覆盖 API 基址，主要用于测试。 */
  apiBase?: string;
  /** 注入 fetch 实现，主要用于测试。 */
  fetchImpl?: typeof fetch;
}

const DEFAULT_PROMPT
  = 'Generate concise on-screen captions for this video. '
  + 'Return a JSON object {"captions":[{"start":<seconds>,"end":<seconds>,"text":"..."}]} '
  + 'covering the whole video in chronological, non-overlapping segments.';

// Pegasus 结构化输出约束：返回带时间戳的字幕数组。
const CAPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    captions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          start: { type: 'number' },
          end: { type: 'number' },
          text: { type: 'string' }
        },
        required: ['start', 'end', 'text']
      }
    }
  },
  required: ['captions']
};

/**
 * 解析 Pegasus analyze 接口返回的内容，提取字幕片段。
 *
 * 兼容两种形态：1) data 字段为 JSON 字符串；2) data 已是对象。
 * 纯函数、无网络依赖，便于单元测试。
 */
export function parseCaptionsResponse(payload: unknown): CaptionSegment[] {
  const data = (payload as { data?: unknown })?.data;
  let parsed: unknown = data;
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch {
      return [];
    }
  }
  const captions = (parsed as { captions?: unknown })?.captions;
  if (!Array.isArray(captions)) {
    return [];
  }
  return captions
    .map(item => {
      const c = item as Record<string, unknown>;
      return {
        start: Number(c.start),
        end: Number(c.end),
        text: typeof c.text === 'string' ? c.text.trim() : ''
      };
    })
    .filter(c => c.text !== '' && Number.isFinite(c.start) && Number.isFinite(c.end) && c.end > c.start);
}

/**
 * 调用 Pegasus 分析视频并返回带时间戳的字幕片段。
 *
 * 注意：服务端拉取并分析视频可能耗时数十秒，调用方应自行处理 loading 状态。
 */
export async function analyzeVideoCaptions(options: AnalyzeVideoCaptionsOptions): Promise<CaptionSegment[]> {
  const {
    apiKey,
    videoUrl,
    prompt = DEFAULT_PROMPT,
    modelName = 'pegasus1.5',
    apiBase = TWELVELABS_API_BASE,
    fetchImpl = fetch
  } = options;

  if (!apiKey) {
    throw new Error('TwelveLabs API key is required');
  }

  const response = await fetchImpl(`${apiBase}/analyze`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    // TwelveLabs REST API 字段为 snake_case，此处按其契约书写。
    /* eslint-disable camelcase */
    body: JSON.stringify({
      video: { type: 'url', url: videoUrl },
      model_name: modelName,
      prompt,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'captions', schema: CAPTIONS_SCHEMA }
      }
    })
    /* eslint-enable camelcase */
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`TwelveLabs analyze failed (${response.status}): ${detail}`);
  }

  return parseCaptionsResponse(await response.json());
}

/** 可直接喂给 TextTrack 的字幕源数据：文本样式 + 起始帧 + 帧数。 */
export interface TextCaptionSource {
  /** 传给 `new TextTrack(source, startFrame)` 的第一个参数。 */
  source: TextSource;
  /** 字幕起始帧（curFrame）。 */
  startFrame: number;
  /** 字幕时长（帧），调用方设置 track.frameCount/track.end 时使用。 */
  frameCount: number;
}

/**
 * 将字幕片段转换为编辑器文本轨道所需的源数据。时间（秒）按 baseFps 换算为帧。
 *
 * 不直接构造 TextTrack（避免引入渲染层副作用）；调用方在浏览器侧这样用：
 *   const track = new TextTrack(item.source, item.startFrame);
 *   track.frameCount = item.frameCount;
 *   track.end = item.startFrame + item.frameCount;
 */
export function captionsToTextSources(captions: CaptionSegment[]): TextCaptionSource[] {
  return captions.map(caption => {
    const startFrame = Math.round(caption.start * baseFps);
    const endFrame = Math.round(caption.end * baseFps);
    return {
      source: {
        content: caption.text,
        fill: '#ffffff',
        stroke: '#000000',
        fontSize: 24,
        fontFamily: 'Arial',
        name: caption.text.slice(0, 20)
      },
      startFrame,
      frameCount: Math.max(1, endFrame - startFrame)
    };
  });
}
