画布使用WebAV
```ts
const spr = new VisibleSprite(
  new MP4Clip(stream, {
    __unsafe_hardwareAcceleration__,
  }),
)
await avCvs?.addSprite(spr)
addSprite2Track('1-video', spr, '视频')

const [tlData, setTLData] = useState<TimelineRow[]>([
  { id: '1-video', actions: [] },
  { id: '2-audio', actions: [] },
  { id: '3-img', actions: [] },
  { id: '4-text', actions: [] },
])

function addSprite2Track(trackId: string, spr: VisibleSprite, name = '') {
  const track = tlData.find(({ id }) => id === trackId)
  if (track == null)
    return null

  const start
    = spr.time.offset === 0
      ? Math.max(...track.actions.map(a => a.end), 0) * 1e6
      : spr.time.offset

  spr.time.offset = start
  // image
  if (spr.time.duration === Infinity) {
    spr.time.duration = 10e6
  }

  const action = {
    id: Math.random().toString(),
    start: start / 1e6,
    end: (spr.time.offset + spr.time.duration) / 1e6,
    effectId: '',
    name,
  }

  actionSpriteMap.set(action, spr)

  track.actions.push(action)
  setTLData(
    tlData
      .filter(it => it !== track)
      .concat({ ...track })
      .sort((a, b) => a.id.charCodeAt(0) - b.id.charCodeAt(0)),
  )
  return action
}
```
WebAV逻辑，avCvs用来保存画布信息，tlData保存轨道信息（start、end），然后使用actionSpriteMap进行关联

Track数据结构：

clip 需要实现缩略图等
spr 画布对象
start
end
offsetL
offsetR
frameCount 总帧数
