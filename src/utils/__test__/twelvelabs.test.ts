import { describe, it, expect } from 'vitest';
import { parseCaptionsResponse, analyzeVideoCaptions, captionsToTextSources } from '../twelvelabs';
import { baseFps } from '@/data/trackConfig';

describe('parseCaptionsResponse', () => {
    it('parses captions from a JSON-string data field', () => {
        const payload = {
            data: JSON.stringify({
                captions: [
                    { start: 0, end: 2.5, text: 'Hello world' },
                    { start: 2.5, end: 5, text: '  trimmed  ' }
                ]
            })
        };
        expect(parseCaptionsResponse(payload)).toEqual([
            { start: 0, end: 2.5, text: 'Hello world' },
            { start: 2.5, end: 5, text: 'trimmed' }
        ]);
    });

    it('parses captions when data is already an object', () => {
        const payload = { data: { captions: [{ start: 1, end: 3, text: 'hi' }] }};
        expect(parseCaptionsResponse(payload)).toEqual([{ start: 1, end: 3, text: 'hi' }]);
    });

    it('drops invalid segments (empty text, NaN, zero/negative duration)', () => {
        const payload = {
            data: {
                captions: [
                    { start: 0, end: 2, text: '' },
                    { start: 'x', end: 2, text: 'bad start' },
                    { start: 3, end: 3, text: 'zero length' },
                    { start: 5, end: 4, text: 'reversed' },
                    { start: 6, end: 8, text: 'good' }
                ]
            }
        };
        expect(parseCaptionsResponse(payload)).toEqual([{ start: 6, end: 8, text: 'good' }]);
    });

    it('returns empty array for malformed input', () => {
        expect(parseCaptionsResponse(null)).toEqual([]);
        expect(parseCaptionsResponse({ data: 'not json' })).toEqual([]);
        expect(parseCaptionsResponse({ data: { captions: 'nope' }})).toEqual([]);
    });
});

describe('captionsToTextSources', () => {
    it('converts seconds to frames using baseFps and sets per-caption duration', () => {
        const [item] = captionsToTextSources([{ start: 1, end: 3, text: 'caption' }]);
        expect(item.startFrame).toBe(Number(baseFps));
        expect(item.frameCount).toBe(2 * baseFps);
        expect(item.source.content).toBe('caption');
        expect(item.source.name).toBe('caption');
    });

    it('clamps zero-or-negative durations to at least one frame', () => {
        const [item] = captionsToTextSources([{ start: 1, end: 1, text: 'x' }]);
        expect(item.frameCount).toBe(1);
    });
});

describe('analyzeVideoCaptions (unit, mocked fetch)', () => {
    it('posts to the analyze endpoint with the api key and parses the result', async() => {
        let captured: { url: string; init: Parameters<typeof fetch>[1] } | undefined;
        const fakeFetch = (async(url: string, init: Parameters<typeof fetch>[1]) => {
            captured = { url, init };
            return {
                ok: true,
                json: async() => ({ data: { captions: [{ start: 0, end: 1, text: 'ok' }] }})
            } as Response;
        }) as unknown as typeof fetch;

        const result = await analyzeVideoCaptions({
            apiKey: 'test-key',
            videoUrl: 'https://example.com/v.mp4',
            apiBase: 'https://api.example.test/v1.3',
            fetchImpl: fakeFetch
        });

        expect(result).toEqual([{ start: 0, end: 1, text: 'ok' }]);
        expect(captured?.url).toBe('https://api.example.test/v1.3/analyze');
        expect((captured?.init?.headers as Record<string, string>)['x-api-key']).toBe('test-key');
        const body = JSON.parse(captured?.init?.body as string);
        expect(body.video).toEqual({ type: 'url', url: 'https://example.com/v.mp4' });
        // eslint-disable-next-line camelcase
        expect(body.model_name).toBe('pegasus1.5');
    });

    it('throws when no api key is provided', async() => {
        await expect(
            analyzeVideoCaptions({ apiKey: '', videoUrl: 'https://example.com/v.mp4' })
        ).rejects.toThrow(/api key/i);
    });
});

// 需要真实 API Key 时才运行的联网用例；缺少 key 时跳过。
const liveKey = process.env.TWELVELABS_API_KEY;
describe.runIf(liveKey)('analyzeVideoCaptions (live)', () => {
    it('reaches the analyze endpoint with valid wiring', async() => {
        // 仅验证请求被服务端接受（鉴权/参数正确），不依赖具体视频可被处理。
        const res = await fetch('https://api.twelvelabs.io/v1.3/analyze', {
            method: 'POST',
            headers: { 'x-api-key': liveKey as string, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                video: { type: 'url', url: 'https://example.com/missing.mp4' },
                // eslint-disable-next-line camelcase
                model_name: 'pegasus1.5',
                prompt: 'describe'
            })
        });
        // 401/404 表示鉴权或路由错误；其它状态表示 wiring 正确。
        expect(res.status).not.toBe(401);
        expect(res.status).not.toBe(404);
    }, 60000);
});
