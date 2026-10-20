# VOLI 短片：录制和后期指南

这份指南从"打开网页"一直讲到"在 Premiere 里导出成片"。设计依据见 `docs/superpowers/specs/2026-10-19-screenlife-film-design.md`。

## 1. 启动本地服务

在项目文件夹里运行：

```bash
npm run serve
```

终端显示 `Serving the film at http://localhost:8765/` 就说明可以了。录制期间不要关掉这个终端。

在 Chrome 里打开 `http://localhost:8765/` 可以预览整部片。Chrome 会先显示 "Click to start"，点一下才开始（浏览器不允许网页自动播放声音；OBS 里不会出现这一步）。

常用网址参数：

| 网址 | 作用 |
|---|---|
| `?scene=3` | 只播放第 3 段（0–11） |
| `?scene=3&debug=1` | 左下角显示时间码和当前节拍名，**录制时不要加** |
| `?scene=10&pause=27000` | 停在第 10 段第 27 秒，用来截图看画面 |

## 2. 在 OBS 里录制

1. 新建场景，添加来源 → **浏览器**。
2. 设置：
   - URL：`http://localhost:8765/?scene=0`
   - 宽度 `3840`，高度 `2160`
   - 帧率：自定义 `30`
   - 勾选 **通过 OBS 控制音频**
   - 勾选 **场景激活时刷新浏览器**
3. 设置 → 视频：基础分辨率和输出分辨率都设为 `3840×2160`，帧率 `30`。
4. 设置 → 输出 → 录像：格式 `mov` 或 `mkv`，编码器选硬件编码（Apple VT H264），码率 50000 Kbps 以上。
5. 一段一段录：每次把 URL 里的 `scene=` 改成下一段，开始录制，再刷新浏览器源；等画面停住（每段的长度见下表）再停止录制。每段存成单独的文件，比如 `00-cold-open.mov`。

| 段 | 名称 | 长度 |
|---|---|---|
| 0 | cold open | 0:25 |
| 1 | Mia | 0:30 |
| 2 | install | 0:20 |
| 3 | questions | 0:40 |
| 4 | observation | 0:15 |
| 5 | responsibility | 0:25 |
| 6 | handover | 0:15 |
| 7 | autopilot | 0:20 |
| 8 | Mia again | 0:20 |
| 9 | can't quit | 0:15 |
| 10 | many days | 0:35 |
| 11 | pass it on | 0:25 |

每段都是从刷新那一刻开始计时。在 Premiere 里把每段剪成正好上表的长度（从网页开始播放的那一帧算起），首尾相接，总长 4:45。

**第一次录之前先做一次丢帧测试**：用 `?scene=0` 录 10 秒，看 OBS 底部状态栏或"统计"面板里的丢帧比例。超过 1% 的话，打开 `assets/stylesheets/film/base.css`，把 `--glass-blur: 40px;` 改成 `24px` 再试。

## 3. Premiere 标记

`docs/film-markers/` 里有两份文件，内容一样：

- `markers.xml`：在 Premiere 里 **文件 → 导入** 它，会得到一个名为 "VOLI markers" 的空序列，时间线上已经有每个节拍的标记，标记名后面附带了镜头说明。把录好的 12 段首尾相接放进这个序列。
- `markers.md`：如果 XML 导入不成功，就按这张表手动对照时间码。

如果改了剧本或替换了配音，重新生成标记：

```bash
node tools/check-scenes.mjs --export-log /tmp/film-log.json
```

```bash
node tools/markers.mjs /tmp/film-log.json docs/film-markers
```

## 4. Premiere 里的镜头

- 序列设置：1920×1080，30fps。4K 素材放进来缩放到 50%，就是"100%"画面；推近到 200% 就是素材的 100%，依然清晰。
- **她操作时**：画面一直在极慢地漂移和缩放（10 秒内不超过 2%），用缓入缓出关键帧。
- **从第 6 段 `takeover` 标记开始**：镜头完全静止；需要移动时只用**线性**关键帧（匀速、走直线）。第 9 段漂移恢复。
- 每个节拍具体怎么推拉，看标记名后面的说明（来自设计文档第 7 节）。
- 全片只有两处硬切：进入第 10 段，和第 11 段开头。

## 5. Premiere 里的声音

网页已经把配音、键盘声、点击声和系统音效录进了每段素材。后期另外加三层，素材在 `assets/film/post/`：

| 文件 | 用法 |
|---|---|
| `roomtone.wav` | 房间底噪，约 -45 dB，从第 0 段开始一直垫着；到第 6 段 `takeover` 标记处用 2 秒淡出，之后不再出现 |
| `drone.wav` | 40–60Hz 低频嗡鸣，约 -40 dB，从第 4 段 `line` 标记开始；第 10 段音乐进入时让位 |
| `on-repeat-loop.wav` | 只用于第 10 段：循环铺满到 `music-stop` 标记处戛然而止；每循环一次速度慢约 3%、音高下沉一点 |

刻意留白的地方：第 4 段那句话出现后的 3 秒；第 8 段配音断掉之后；第 10 段音乐停下后的 2 秒；第 11 段黑屏。

导出：成片整体响度 -16 LUFS（**效果 → 响度标准化**，或在导出设置里勾选"响度标准化"）。

## 6. 替换素材

| 想换的东西 | 怎么做 |
|---|---|
| 壁纸 | 用你自己的照片覆盖 `assets/film/wallpapers/her.jpg`（深夜、失焦最好，3:2 或 16:9 都行），然后运行 `node tools/render-grid-thumbs.mjs` 重新生成第 10 段的墙 |
| 键盘声 | 用手机录 30 秒自己 MacBook 的打字声，导出为 WAV，运行 `node tools/slice-keys.mjs 录音.wav`，会覆盖 `assets/film/sfx/key1.wav … key8.wav` |
| 房间底噪 | 录 1 分钟自己房间深夜的环境声，导出为 WAV，覆盖 `assets/film/post/roomtone.wav` |
| 配音 | 见第 7 节 |

## 7. 正式配音（ElevenLabs）

1. 在 ElevenLabs 选两个声音：她（二十岁左右的女声，低、近、疲惫）和 Mia（更亮、更快、更随意），记下两个 Voice ID。
2. 生成，每句 3 个版本：

```bash
ELEVENLABS_API_KEY=你的key HER_VOICE_ID=她的ID MIA_VOICE_ID=Mia的ID node tools/tts.mjs
```

3. 在 `assets/film/voice/` 里试听 `P2.take1.wav` 这类文件，选好之后：

```bash
node tools/tts.mjs --pick P1a=2,P1b=1,P2=3,P3=1,P4=2,P5=1,M1=1,M2=2,M3=1,M4=3,M5=1,M6=1,M7=2,M8=1
```

4. 打字速度会自动跟着新配音变。运行 `node tools/check-scenes.mjs --rate 4`：如果显示 `overrun`，说明某句配音太长，超出了那一段的时间预算。可以换一个短一点的版本，或者告诉我调整那一段的节奏。

用的是 OpenAI 而不是 ElevenLabs 的话，告诉我，`tools/tts.mjs` 只需要改请求地址和参数。

## 8. 版权提醒

macOS 的图标、系统音效和字体属于 Apple。课堂作业可以使用；如果要公开发布或参展，需要换成 CC0 授权的替代品。
