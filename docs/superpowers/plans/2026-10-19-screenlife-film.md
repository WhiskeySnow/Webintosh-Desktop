# VOLI Screenlife Film Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `index.html` 改造成一部自动播放、可逐段录制的 screenlife 短片（12 段，约 4:45），供 OBS 录制、Premiere 剪辑。

**Architecture:** 原生 ES 模块，不引入运行时依赖。一个虚拟时间轴（`clock.js`）驱动一切：导演按场景脚本调度光标、键盘、声音和界面组件；所有时间都相对场景起点锚定，所以总时长不随配音长短漂移。纯逻辑模块（时间轴、世界时间格式化、光标路径、打字计划、标记导出）用 `node --test` 测；页面行为用一个基于 Chrome DevTools 协议的小工具，在无界面 Chrome 里跑场景、读日志、截图。

**Tech Stack:** HTML/CSS/原生 JS（ES modules）、Web Audio API、Node 24（`node:test`、全局 `WebSocket`/`fetch`）、系统 Google Chrome（无界面模式）、macOS 命令行工具（`sips`、`qlmanage`、`afconvert`、`say`）。

**Spec:** `docs/superpowers/specs/2026-10-19-screenlife-film-design.md`（参考图在 `docs/superpowers/specs/screenlife-film-mockups/`）

## Global Constraints

- 逻辑舞台固定 1920×1080；窗口比例不是 16:9 时，按 `min(w/1920, h/1080)` 等比缩放并居中，四周留黑。
- 总时长 ≤ 5:00；12 段的目标时长之和 = 285 秒。
- 纯英文界面和配音，没有字幕。
- 所有界面只读 `world.js` 的虚构时间；`src/javascripts/film/` 里禁止出现无参数的 `new Date()` 和 `Date.now(`。
- 播放时不允许任何外部网络请求（只能请求本地服务器上的文件）。
- VOLI 永远不发声。唯一例外：第 5 段辅助功能开关的 `toggle` 音效。
- 人的打字：总时长 = 对应配音时长；VOLI 的打字：每字 45ms，没有键盘声。
- 人的光标：缓动、过冲、抖动、有点击声；VOLI 的光标：匀速直线、无抖动、无点击声。
- 材质：毛玻璃统一用 `backdrop-filter: blur(40px) saturate(180%)`；深夜为深色模式，第 10 段为浅色模式。
- 视觉以参考图为准：`desktop.png`、`messages.png`、`voli-b.png`。
- 音频文件一律用 WAV（PCM），保证 OBS 内置浏览器能解码。
- 开发工具只用 Node 内置模块、系统 Chrome 和 macOS 自带命令；不加 npm 依赖。
- Apple 的图标、音效、字体仅用于课堂作品。

## Review Focus

1. **普通 Chrome 预览时音频被自动播放策略拦住** → 应出现 "Click to start" 遮罩，时间轴停在 0，点击后才开始。（测试在 Task 5）
2. **OBS 或浏览器窗口不是 16:9**（2560×1440、1280×800）→ 舞台等比缩放、居中、留黑边，不变形。（测试在 Task 5）
3. **正式 AI 配音比占位音长，超出场景预算** → 导演在日志里记一条 `overrun`（场景名、超出毫秒数），后面的锚点顺延，不重叠、不崩溃。（测试在 Task 5）
4. **某个音频文件缺失（404）** → 不崩溃；`__film.errors` 记下缺失的编号，配音时长按每字 60ms 估算，静音继续。（测试在 Task 6）
5. **代码里不小心用了真实时间** → 源码检查测试直接失败。（测试在 Task 2）

---

## 文件结构

```
index.html                                  影片入口（替换现有内容）
package.json                                只有 scripts，"type": "module"
src/javascripts/film/
  main.js            入口：读 URL 参数、挂舞台、加载素材、启动导演
  clock.js           虚拟时间轴（纯逻辑）
  world.js           虚构时间/电量/外观 + 格式化函数（纯逻辑）
  motion.js          光标路径规划（纯逻辑）
  typing.js          打字计划（纯逻辑）
  stage.js           1920×1080 舞台与缩放
  director.js        场景调度、节拍日志、debug 叠层、暂停、overrun
  sound.js           Web Audio 加载与播放
  cursor.js          DOM 光标（用 motion.js）
  keyboard.js        DOM 打字（用 typing.js）
  data/story.js      剧本数据：时间线、文件、联系人、台词、每日选择、场景目标时长
  data/manifest.js   素材清单（编号 → 路径）
  ui/shell.js        壁纸、菜单栏、桌面图标、Dock
  ui/notifications.js
  ui/windows.js      窗口外框与焦点管理
  ui/safari.js  ui/finder.js  ui/stickies.js
  ui/messages.js
  ui/voli.js
  ui/system.js       系统对话框 + 系统设置·辅助功能
  ui/grid.js         第 10 段拉远网格
  scenes/index.js    场景列表
  scenes/establish.js 按检查点重建场景起始状态
  scenes/00-cold-open.js … scenes/11-pass-it-on.js
  scenes/dev.js      仅测试用的场景（?dev=名称）
assets/stylesheets/film/ base.css apps.css messages.css voli.css
assets/film/ icons/ thumbs/ wallpapers/ avatars/ voice/ sfx/ grid/ post/
tools/
  serve.mjs          本地静态服务器（支持 Range，端口 8765）
  cdp.mjs            启动无界面 Chrome + 最小 CDP 客户端
  check-scenes.mjs   跑场景、校验时长/日志/网络、可重复多次
  shoot.mjs          按 URL 截图
  export-mac-assets.sh  导出系统图标/预览/音效/壁纸缩略图
  make-placeholder-voices.sh  用 say 生成占位配音
  synth.mjs          生成占位键盘声、嗡鸣、底噪、音乐循环（WAV）
  tts.mjs            ElevenLabs 生成正式配音
  render-grid-thumbs.mjs
  markers.mjs        节拍日志 → FCP7 XML + Markdown 标记表
tests/  *.test.mjs（单元）  browser/*.test.mjs（浏览器）
```

---

### Task 1: 工程骨架与虚拟时间轴

**Files:**
- Create: `package.json`, `src/javascripts/film/clock.js`, `tests/clock.test.mjs`
- Modify: `.gitignore`（追加 `.superpowers/`、`assets/film/voice/*.take*.wav`）

**Interfaces:**
- Produces:
  - `class Timeline { constructor({ now, sleep, rate = 1 }) ; start(): void ; get t(): number ; get cursor(): number ; wait(ms): Promise<void> ; until(ms): Promise<void> ; animate(durationMs, onProgress: (p:number)=>void): Promise<void> ; freezeAt(ms): void }`
  - `t` = `(now() - startedAt) * rate`，若设置了 `freezeAt` 则不超过它。
  - `wait(ms)` 把 `cursor += ms`，在 `t >= cursor` 时 resolve（锚定在调度时间上，不在"现在"上，所以不会累积漂移）。
  - `until(ms)` 把 `cursor = max(cursor, ms)` 后同上。
  - `animate` 从当前 `cursor` 起，到 `cursor + durationMs` 止，每帧回调 `p ∈ [0,1]`，最后一定回调一次 `p = 1`，结束后 `cursor += durationMs`。
  - 冻结后，时间到达冻结点的 `wait/until/animate` 永不 resolve。
  - `package.json` scripts：`"test": "node --test tests/*.test.mjs"`, `"test:browser": "node --test --test-concurrency=1 tests/browser/"`, `"serve": "node tools/serve.mjs"`, `"check": "node tools/check-scenes.mjs"`。

- [ ] **Step 1: 写失败的测试** `tests/clock.test.mjs`，用假时钟：`let now = 0; const tl = new Timeline({ now: () => now, sleep: async () => { now += 5; } })`
  - `wait(100)` 两次后 `cursor === 200`，且 resolve 时 `t >= 200`。
  - `rate: 4` 时，`now` 前进 50，`t === 200`。
  - `until(50)` 在 `cursor === 200` 时不改变 `cursor`。
  - `animate(100, cb)` 的最后一次回调值是 `1`，回调值单调不减，结束后 `cursor` 增加 100。
  - `freezeAt(150)` 后 `t` 永远 ≤ 150；`wait(200)` 在 `now` 推进到很大时仍未 resolve（用 `Promise.race` 加一个已 resolve 的标记来断言）。
- [ ] **Step 2:** `npm test` → FAIL（模块不存在）
- [ ] **Step 3:** 实现 `clock.js`。浏览器里默认 `now = () => performance.now()`，`sleep = () => new Promise(requestAnimationFrame)`。
- [ ] **Step 4:** `npm test` → PASS
- [ ] **Step 5:** `git add package.json .gitignore src/javascripts/film/clock.js tests/clock.test.mjs && git commit -m "Add film timeline and test scaffolding"`

---

### Task 2: 世界时间、剧本数据与"禁用真实时间"检查

**Files:**
- Create: `src/javascripts/film/world.js`, `src/javascripts/film/data/story.js`, `tests/world.test.mjs`, `tests/story.test.mjs`, `tests/no-real-time.test.mjs`

**Interfaces:**
- Produces（`world.js`）：
  - `formatMenuClock(date): string` → `"Wed Oct 14  11:47 PM"`（日期和时间之间两个空格）
  - `formatTime(date): string` → `"11:47 PM"`，`"12:05 AM"`
  - `formatListLabel(date, now): string` → 同一天 `"10:02 PM"`；前一天 `"Yesterday"`；7 天内 `"Monday"`；更早 `"10/12/26"`
  - `formatChatStamp(date, now): { day: string, time: string }` → `{ day: "Today", time: "11:47 PM" }` / `"Yesterday"` / 星期名 / `"10/12/26"`
  - `formatDockDay(date): { month: "OCT", day: "14" }`
  - `createWorld({ time: Date, battery: number, appearance: "dark"|"light" }): { get(), set(patch), subscribe(fn): () => void }`
- Produces（`data/story.js`，命名导出，值全部取自 spec）：
  - `SCENES`：12 项 `{ id, title, targetMs }`，id 依次为 `00-cold-open, 01-mia, 02-install, 03-questions, 04-observation, 05-responsibility, 06-handover, 07-autopilot, 08-mia-again, 09-cant-quit, 10-days, 11-pass-it-on`，targetMs 依次为 `25000, 30000, 20000, 40000, 15000, 25000, 15000, 20000, 20000, 15000, 35000, 25000`
  - `TIMELINE`：每段起始 `{ time, battery, appearance }`（spec 第 3 节；第 10 段起始 Oct 15 8:12 AM、battery 96、light）
  - `DESKTOP_FILES`：10 项 `{ name, thumb }`，顺序同 spec 第 3 节；`SELECTED_FILE = "unsent.txt"`
  - `STICKY_LINES`：spec 中 5 行原文
  - `CONTACTS`：`mia`（Mia Chen，pinned，avatar）、`mom`（pinned）、`floor`（3rd floor 🪴，pinned，avatar）、`jordan`（Jordan (TBM)，unread，avatar，Wed Oct 14 10:02 PM "did u pick a topic yet. i’m doing sound again lol"）、`sam`（Sam Okafor，8:41 PM "lmk if u want food tmrw, i’m free after 2"）、`dad`（Sun Oct 11 9:30 AM "Mom said you sounded stressed. Everything ok? Call when you can"）、`daniel`（Daniel Kim，Mon Oct 12 6:15 PM "haha ok see u thursday"）、`ig`（32665，Sat Oct 10 2:03 PM "Your Instagram code is 482 913. Don’t share it."）
  - `MIA_HISTORY`：Tue Oct 13 4:12 PM 三条（"did u eat" / "kinda" / "kinda???"）
  - `VOICE_LINES`：14 项 `{ id, role: "her"|"mia", text, direction }`，即 spec 配音表（P1a…P5、M1…M8）
  - `HOVER = { stay: 2.3, truth: 0.4 }`
  - `DAYS`：5 项 `{ day, date, items: [[label, value]], acceptedIn }`，即 spec 第 10 段（Day 40 的 `items` 为空，`note: "Today’s choices were made for you."`）

- [ ] **Step 1: 写失败的测试**
  - `formatMenuClock(new Date(2026, 9, 14, 23, 47)) === "Wed Oct 14  11:47 PM"`
  - `formatTime(new Date(2026, 9, 15, 0, 5)) === "12:05 AM"`
  - 以 `now = new Date(2026, 9, 14, 23, 47)`：`formatListLabel(new Date(2026, 9, 14, 22, 2), now) === "10:02 PM"`；`Oct 13 → "Yesterday"`；`Oct 12 → "Monday"`
  - 以 `now = new Date(2026, 10, 24, 23, 47)`：`formatListLabel(new Date(2026, 9, 12, 18, 15), now) === "10/12/26"`
  - `formatDockDay(new Date(2026, 9, 14))` 深等于 `{ month: "OCT", day: "14" }`
  - `createWorld` 的 `subscribe` 在 `set` 后收到新状态，取消订阅后不再收到
  - `story.test.mjs`：`SCENES` 长 12，`targetMs` 之和 `=== 285000` 且 `<= 300000`；`VOICE_LINES` 的 id 集合恰为 spec 的 14 个；`DAYS.map(d => d.acceptedIn)` 深等于 `[2.3, 1.4, 0.6, 0.2, 0]`
  - `no-real-time.test.mjs`：递归读取 `src/javascripts/film/**/*.js`，任何文件匹配 `/new Date\(\s*\)|Date\.now\(/` 即失败，并在失败信息里列出文件名
- [ ] **Step 2:** `npm test` → FAIL
- [ ] **Step 3:** 实现 `world.js`（用 `Intl.DateTimeFormat("en-US", …)` 或手写，不读系统时区以外的东西）与 `data/story.js`
- [ ] **Step 4:** `npm test` → PASS
- [ ] **Step 5:** Commit：`"Add story world clock and script data"`

---

### Task 3: 光标路径规划

**Files:**
- Create: `src/javascripts/film/motion.js`, `tests/motion.test.mjs`

**Interfaces:**
- Produces:
  - `makeRng(seed: number): () => number`（mulberry32）
  - `humanDuration(from, to, rng): number` = `250 + 120 * log2(dist / 20 + 1)` 毫秒，乘以 `0.9 + 0.2 * rng()`
  - `planHumanPath(from: {x,y}, to: {x,y}, { durationMs, seed }): Array<{ t, x, y }>`：每 16ms 一个采样，`t` 从 0 到 `durationMs`
  - `planMachinePath(from, to, { pxPerMs = 1.2 }): Array<{ t, x, y }>`
  - `samplePath(path, t): { x, y }`（线性插值）
- 人的路径：三次贝塞尔，两个控制点各向垂直方向偏移 `±(0.08–0.15) × 距离`；时间用最小加加速度曲线 `10s³ − 15s⁴ + 6s⁵`；在 88% 时刻越过目标 2–6px，最后 12% 回到目标；叠加 ±0.6px 的低频抖动（终点为 0）。
- 机器的路径：线性插值，匀速，没有任何偏移。

- [ ] **Step 1: 写失败的测试**
  - 同一 seed 两次 `planHumanPath` 深相等；不同 seed 不相等
  - 人：最后一点恰为 `to`；`(0,0)→(400,0)` 时最大 x 在 `[402, 406]` 之间；最大 |y| > 3
  - 机器：最后一点恰为 `to`；每点到直线距离 < 1e-9；相邻采样步长相等（除最后一步，误差 1e-6）；`t` 末值 = `dist / pxPerMs`
  - `samplePath(path, path.at(-1).t + 100)` 返回终点
- [ ] **Step 2:** `npm test` → FAIL
- [ ] **Step 3:** 实现 `motion.js`
- [ ] **Step 4:** `npm test` → PASS
- [ ] **Step 5:** Commit：`"Add human and machine cursor paths"`

---

### Task 4: 打字计划

**Files:**
- Create: `src/javascripts/film/typing.js`, `tests/typing.test.mjs`

**Interfaces:**
- Produces:
  - `planTyping(ops, { mode: "human"|"machine", durationMs?, seed = 1 }): Array<{ t, op: "insert"|"delete", char? }>`
    - `ops` 是数组，元素为字符串、`{ del: n }` 或 `{ pause: ms }`
    - machine：每个 insert/delete 间隔 45ms，第一个事件在 `t = 45`
    - human：基础间隔 = 1，空格 ×1.4，`, . ? !` 之后的下一个字 ×3，再乘 `0.65–1.35` 的随机系数；删除间隔 ×0.6；`pause` 原样插入；给了 `durationMs` 时整体缩放，使最后一个事件恰在 `durationMs`
  - `applyTyping(initial: string, plan): string`

- [ ] **Step 1: 写失败的测试**
  - `planTyping(["abc"], { mode: "machine" }).map(e => e.t)` 深等于 `[45, 90, 135]`
  - human、`durationMs: 1000`、`["what is it?"]`：最后一个 `t === 1000`，`t` 严格递增
  - human、`["hi, you"]`：逗号后那个字的间隔 > 所有间隔的中位数 × 2
  - `applyTyping("I just", planTyping([{ del: 6 }, { pause: 900 }, "I just"], { mode: "human" })) === "I just"`
  - 含 `{ pause: 900 }` 的计划里，相邻两事件的间隔至少有一个 ≥ 900
- [ ] **Step 2:** FAIL → **Step 3:** 实现 → **Step 4:** PASS
- [ ] **Step 5:** Commit：`"Add typing planner"`

---

### Task 5: 舞台、导演、入口与浏览器测试工具

**Files:**
- Create: `src/javascripts/film/stage.js`, `director.js`, `main.js`, `scenes/index.js`, `scenes/dev.js`, `assets/stylesheets/film/base.css`（先只有舞台与 debug 叠层样式），`tools/serve.mjs`, `tools/cdp.mjs`, `tools/check-scenes.mjs`, `tools/shoot.mjs`, `tests/browser/director.test.mjs`
- Modify: `index.html`（整体替换：只加载 `base.css` 等影片样式和 `src/javascripts/film/main.js`）

**Interfaces:**
- Consumes: `Timeline`（Task 1）、`createWorld`、`SCENES`（Task 2）
- Produces:
  - `mountStage(root): { el: HTMLElement, fit(): void }`：舞台元素 1920×1080；`document.documentElement.style.zoom = s`，`s = min(innerWidth/1920, innerHeight/1080)`，舞台居中，`body` 背景纯黑，隐藏真实鼠标
  - 场景模块形状：`export default { id, setup(ctx): Promise<void>, run(ctx): Promise<void> }`
  - `ctx`：`{ timeline, world, sound, cursor, keyboard, ui, beat(name), at(ms), wait(ms), snapshot() }`；`at(ms)` = `timeline.until(sceneStart + ms)`，若 `timeline.cursor` 已超过该点则记录 `overrun`
  - `createDirector({ timeline, scenes, makeCtx }): { run({ scene?: number, dev?: string }): Promise<void> }`
    - 无参数：从第 0 段 `setup` 后连续跑完 12 段；`?scene=N`：只 `setup` 并跑第 N 段，结束后停在最后一帧
    - 每段结束都 `await timeline.until(sceneStart + targetMs)`
  - `window.__film = { log: [{ scene, beat, t }], audioLog: [{ t, id }], overruns: [{ scene, beat, ms }], errors: [], done: false }`；每段开始自动记 `beat: "start"`
  - URL 参数：`scene`、`dev`、`debug=1`（左下角显示时间码 `MM:SS.mmm` 和当前节拍名）、`rate`（默认 1）、`pause=ms`（`timeline.freezeAt`）
  - 非法 `scene`（非整数或越界）：页面中央显示 `Unknown scene "<值>". Valid: 0–11`，`__film.errors` 记一条，不启动
  - 音频上下文不是 `running` 时显示全屏遮罩 "Click to start"，点击后 `resume()` 再 `timeline.start()`
  - `tools/serve.mjs`：`node:http` 静态服务，根目录为仓库，端口 8765，支持 `Range`，正确的 `Content-Type`（`.js .css .svg .png .jpg .wav .woff2 .otf .json`）
  - `tools/cdp.mjs`：`launchChrome({ width, height, autoplay = true }): Promise<Browser>`；`browser.open(url): Promise<Page>`；`page.eval(expr)`、`page.waitFor(expr, timeoutMs)`、`page.screenshot(path)`、`page.requests: string[]`（所有请求 URL）、`page.click(x, y)`；`browser.close()`。Chrome 路径 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`，参数 `--headless=new --hide-scrollbars --remote-debugging-port=<空闲端口> --user-data-dir=<临时目录>`，`autoplay` 为真时加 `--autoplay-policy=no-user-gesture-required`
  - `tools/check-scenes.mjs [--scene N] [--rate R] [--repeat K] [--dev name]`：自带启动 `serve.mjs`；打印每段实际时长、节拍、overrun、errors、非本地请求；任何 error、非本地请求、某段时长偏离 `targetMs` 超过 300ms、或 `--repeat` 时同一节拍时间差 > 50ms，退出码为 1
  - `tools/shoot.mjs --url "<查询串>" --out <png> [--size 1920x1080]`
  - `scenes/dev.js` 导出若干测试场景，按 `?dev=<name>` 运行：`dev-anchors`（`at(1000)`、`wait(600)`、`at(1200)` → 调度时间已到 1600，产生一条 400ms 的 overrun）
  - 没有场景时（Task 13 之前）直接打开 `index.html` 只显示桌面黑底并把 `done` 设为真

- [ ] **Step 1: 写失败的浏览器测试** `tests/browser/director.test.mjs`
  - `?dev=dev-anchors&rate=4`：`__film.done` 最终为真；`log` 节拍顺序正确；`overruns.length === 1` 且 `overruns[0].ms` 在 `[350, 450]`
  - `?scene=99`：页面文字含 `Unknown scene "99"`，`errors.length === 1`
  - `autoplay: false` 打开 `?dev=dev-anchors`：页面含 "Click to start"，2 秒后 `__film.log.length === 0`；`page.click(960, 540)` 后 `done` 变真
  - 窗口 2560×1440：舞台 `getBoundingClientRect()` 换算后为 1920×1080 的 4/3 倍，居中；窗口 1280×800：舞台宽 1280、上下黑边相等
  - `page.requests` 全部以 `http://localhost:8765/` 开头
- [ ] **Step 2:** `npm run test:browser` → FAIL
- [ ] **Step 3:** 实现上述文件；替换 `index.html`
- [ ] **Step 4:** `npm run test:browser` → PASS；`npm test` 仍 PASS
- [ ] **Step 5:** Commit：`"Add film stage, director and browser harness"`

---

### Task 6: 声音系统与素材管线

**Files:**
- Create: `src/javascripts/film/sound.js`, `data/manifest.js`, `tools/export-mac-assets.sh`, `tools/make-placeholder-voices.sh`, `tools/synth.mjs`, `tests/browser/sound.test.mjs`
- Create（生成并提交）：`assets/film/sfx/*.wav`、`assets/film/voice/*.wav`（占位）、`assets/film/post/{drone,roomtone,on-repeat-loop}.wav`、`assets/film/icons/*.png`、`assets/film/thumbs/*.png`、`assets/film/avatars/*.jpg`、`assets/film/wallpapers/*.jpg`

**Interfaces:**
- Produces:
  - `createSound({ base = "assets/film/" }): { load(manifest): Promise<void>, duration(id): number, play(id, { gain = 1, cutAt }?): void, ctx: AudioContext }`
    - `play` 把 `{ t: timeline.t, id }` 写进 `__film.audioLog`
    - `cutAt ∈ (0,1)`：播放到该比例处用 10ms 淡出停止；`duration(id)` 不受影响，另提供 `cutDuration(id, cutAt)`
    - 加载失败的编号：写进 `__film.errors`（`missing:<id>`）；配音的 `duration` 退化为 `文本字符数 × 60`；`play` 静默
  - `manifest`：`voice.<ID>` → `voice/<ID>.wav`（14 个）；`sfx` 编号：`key1`…`key8`、`space`、`return`、`click`、`send`、`receive`、`notify`、`finderError`、`toggle`
  - 素材来源（`export-mac-assets.sh`，幂等）：
    - `send` ← `/System/Library/Components/CoreAudio.component/Contents/SharedSupport/SystemSounds/system/SentMessage.caf`
    - `receive`、`notify` ← 先在系统里 `find` Messages 收到消息的音效；找不到则 `receive` 用 `/System/Library/Sounds/Tink.aiff`，`notify` 用 `/System/Library/Sounds/Glass.aiff`
    - `finderError` ← `/System/Library/Sounds/Funk.aiff`
    - 全部用 `afconvert -f WAVE -d LEI16@44100` 转成 WAV
    - 图标：`sips -s format png -Z 256` 从各 app 的 `.icns` 导出（Finder、Launchpad、Safari、Messages、Mail、Photos、Notes、Music、Pages、Stickies、Preview、System Settings、Calendar），找不到的 app 用 `GenericApplicationIcon.icns`；`folder`、`downloads`、`generic-doc` 来自 CoreTypes；`trash` 来自 `Dock.app/Contents/Resources/trashfull@2x.png`
    - 壁纸缩略图：`/System/Library/Desktop Pictures/.thumbnails/*.heic` 中至少 12 张转 JPG 到 `wallpapers/others/`
    - 文件预览、头像、主角壁纸占位：从 `docs/superpowers/specs/screenlife-film-mockups/assets/` 复制（`th-*.png`、`av-*.jpg`、`v2-wall.jpg` → `wallpapers/her.jpg`）
  - `make-placeholder-voices.sh`：`say -v Samantha -r 165`（her）/ `say -v Karen -r 185`（mia），文本取自 `VOICE_LINES`（脚本里写死同样的 14 行），转 WAV；P5 生成完整的 "yeah delete"
  - `synth.mjs`：用 Node 写 16-bit WAV：`key1..8`（3–6ms 带通噪声脉冲 + 20ms 衰减，音高各不同）、`space`、`return`、`click`、`toggle`（短而干的咔哒）；`post/drone.wav`（45Hz+52Hz 正弦，60s）、`post/roomtone.wav`（布朗噪声 + 很低的 60Hz 嗡声，60s）、`post/on-repeat-loop.wav`（音乐盒风格的 8 小节循环，C 大调、72 BPM）

- [ ] **Step 1: 写失败的浏览器测试** `tests/browser/sound.test.mjs`（用 `dev-sound` 场景）
  - 所有 14 个配音的 `duration(id) > 200`
  - 播放 `key1`、`send` 后 `audioLog` 的 id 顺序正确
  - 用一个含缺失项 `voice.MISSING`（文本 10 个字）的测试清单：`errors` 含 `missing:MISSING`，`duration("MISSING") === 600`，不抛错
- [ ] **Step 2:** FAIL → **Step 3:** 写脚本、运行 `bash tools/export-mac-assets.sh && bash tools/make-placeholder-voices.sh && node tools/synth.mjs`，实现 `sound.js`、`manifest.js`、`dev-sound`
- [ ] **Step 4:** `npm run test:browser` → PASS；`du -sh assets/film` 小于 40MB
- [ ] **Step 5:** Commit：`"Add sound system and generated film assets"`

---

### Task 7: 光标与键盘驱动

**Files:**
- Create: `src/javascripts/film/cursor.js`, `keyboard.js`, `tests/browser/input.test.mjs`
- Modify: `scenes/dev.js`（加 `dev-input`）、`assets/stylesheets/film/base.css`（光标样式）

**Interfaces:**
- Consumes: `planHumanPath`, `planMachinePath`, `humanDuration`, `makeRng`（Task 3）；`planTyping`（Task 4）；`createSound`（Task 6）
- Produces:
  - `createCursor(stage, { timeline, sound, seed }): { pos, moveTo(target, { mode, durationMs?, until?, offset? }): Promise, click({ mode, count = 1 }): Promise, drag(fromEl, to, { mode }): Promise, idle(ms): Promise, hover(ms): Promise }`
    - `target`：`{x,y}`、元素或选择器；元素取中心点再加 `offset: {x, y}`（舞台像素）
    - `until ∈ (0,1]`：只走完路径的这一比例就停（第 6 段用）
    - 每帧用 `document.elementFromPoint` 找到当前元素，对 `[data-hoverable]` 祖先切换 `is-hover` 类，派发 `mouseenter/mouseleave`
    - 停在 `[data-text]` 元素上时显示 I 形光标，否则箭头（参考图样式，带投影）
    - `click`：派发 `mousedown/mouseup/click`（`count = 2` 时再派发 `dblclick`）；仅 human 模式播放 `click`
    - `drag`：复制 `fromEl` 为半透明跟随元素，结束后移除，在落点派发 `drop` 自定义事件 `film-drop`（`detail: { source: fromEl }`）
    - `idle(ms)`：human 时在原地做 ≤3px 的缓慢漂移
  - `createKeyboard({ timeline, sound }): { type(target, ops, { mode, voice?, cutAt?, seed? }): Promise<void> }`
    - `target` 为 `input`/`textarea` 时改 `value`，否则改其 `textContent`
    - human + `voice`：开始时 `sound.play(voice, { cutAt })`，`durationMs = cutAt ? cutDuration : duration(voice)`
    - human 每个 insert 依次轮换播放 `key1…key8`，空格播 `space`，`"\n"` 播 `return`；machine 不发任何声音

- [ ] **Step 1: 写失败的浏览器测试**（`?dev=dev-input&rate=2`，场景里放两个按钮 A/B、一个 input）
  - human 移到 A 并点击：A 收到 1 次 `click`；`audioLog` 含 1 个 `click`
  - machine 移到 B 并点击：B 收到 1 次 `click`；这一步没有新增 `click` 音效
  - `moveTo(B, { mode: "human", until: 0.7 })` 后光标位置在起点与 B 的连线 60%–80% 之间
  - machine 打 `"no keep it"`：input 值正确，这段时间 `audioLog` 没有 `key*`
  - human 打 `"what is it?"`（voice P2）：完成用时与 `duration("P2")` 相差 < 100ms；`audioLog` 含 `P2` 和 ≥10 个 `key*`
- [ ] **Step 2:** FAIL → **Step 3:** 实现 → **Step 4:** PASS
- [ ] **Step 5:** Commit：`"Add cursor and keyboard drivers"`

---

### Task 8: 桌面外壳（壁纸、菜单栏、桌面图标、Dock、通知、窗口）

**Files:**
- Create: `ui/shell.js`, `ui/notifications.js`, `ui/windows.js`, `tests/browser/shell.test.mjs`
- Modify: `assets/stylesheets/film/base.css`（材质、菜单栏、桌面图标、Dock、通知、窗口外框、深浅两套变量）、`scenes/dev.js`（`dev-shell`）

**Interfaces:**
- Consumes: `createWorld` + 格式化函数、`DESKTOP_FILES`、`SELECTED_FILE`
- Produces:
  - `createShell(stage, { world }): { wallpaper: { set(url) }, menubar: { setApp(name, menus), showExtra(id, svgMarkup), extra(id): Element, openExtraMenu(id, items: string[]): { item(label): Element, close() } }, desktop: { icon(name): Element, select(name, { focused }), beginRename(name): HTMLElement, endRename(): void, names(): string[] }, dock: { setRunning(app, on), setBadge(app, n|null), add(app, iconUrl), bounce(app, ms): Promise, el(app): Element } }`
    - 菜单栏时间和电量订阅 `world`；Dock 日历用 `formatDockDay`；`appearance` 切换 `stage.dataset.appearance` 为 `dark`/`light`
    - `select` 会取消其他文件的选中
    - Dock 应用 id（顺序即显示顺序）：`Finder, Launchpad, Safari, Messages, Mail, Photos, Calendar, Notes, Music, Pages, Stickies, Preview`，分隔线后 `Downloads, Trash`；`add("VOLI", …)` 插在 `Preview` 之后
    - 桌面图标从右上角按列排列，列宽 110、行高 106（与参考图一致），长文件名按 Finder 规则中间截断成两行
    - `beginRename` 让标签变成选中全部文字的编辑态，返回可被 `keyboard.type` 写入的元素
  - `createNotifications(stage, { sound }): { show({ app, icon, title, body, time = "now", silent = false }): Element, dismiss(el), clear() }`：新通知在最上面，其余下移；同一 app 连续两条显示堆叠层；非 silent 时播放 `notify`（Messages 来源播放 `receive`）；通知不会自动消失，由场景调用 `dismiss`
  - `createWindows(stage, { shell }): { create({ id, app, menus, x, y, w, h, className }): Win, focus(id), get(id): Win, snapshot() }`，`Win = { el, body, show(), hide(), close() }`；`focus` 让该窗口为活动样式、其余为非活动样式，并调用 `menubar.setApp`
  - 全片使用的窗口 id：`safari`、`finder`、`dmg`、`stickies`、`messages`、`voli`、`settings`

- [ ] **Step 1: 写失败的浏览器测试**（`?dev=dev-shell`，world 为 spec 第 0 段状态）
  - 菜单栏文字含 `"Wed Oct 14  11:47 PM"` 和 `"23%"`；把 world 改到 11:48 后文字随之更新
  - Dock 日历显示 `OCT` / `14`；Mail 角标 `214`
  - `desktop.names()` 深等于 `DESKTOP_FILES` 的名称；`unsent.txt` 带非焦点选中样式
  - 连续 `show` 两条通知：第二条在上方；`audioLog` 有两次 `notify`/`receive`；`silent: true` 时不新增
  - `appearance: "light"` 时舞台 `data-appearance="light"`，菜单栏文字颜色为深色
  - `openExtraMenu("voli", ["Quit VOLI"])` 后 `item("Quit VOLI")` 存在
  - 窗口 3840×2160 打开时 `document.documentElement.style.zoom === "2"`；`node tools/shoot.mjs --url "?dev=dev-shell&pause=500" --size 3840x2160 --out /tmp/shell-4k.png` 后放大查看菜单栏文字，边缘锐利、没有位图放大的模糊
  - 截图 `node tools/shoot.mjs --url "?dev=dev-shell&pause=500" --out /tmp/shell.png`，与 `desktop.png` 对照：壁纸、菜单栏图标、桌面图标与预览、Dock 运行点、通知材质一致
- [ ] **Step 2:** FAIL → **Step 3:** 实现 → **Step 4:** PASS，并完成截图对照
- [ ] **Step 5:** Commit：`"Add macOS shell: menu bar, desktop, dock, notifications, windows"`
- [ ] **Step 6（交给用户）:** 请用户在 OBS 里新建 3840×2160、30fps 的浏览器源，打开 `http://localhost:8765/?dev=dev-shell`，录 10 秒，看"统计"里的丢帧数。丢帧 > 1% 时，把 `--glass-blur` 变量从 40px 降到 24px 后重试，并把结论写进 spec 第 13 节

---

### Task 9: Safari（Google Docs 与 voli.app）、Finder、Stickies

**Files:**
- Create: `ui/safari.js`, `ui/finder.js`, `ui/stickies.js`, `assets/stylesheets/film/apps.css`, `tests/browser/apps.test.mjs`
- Modify: `scenes/dev.js`（`dev-apps`）

**Interfaces:**
- Consumes: `createWindows`、`createShell`（Task 8）、`STICKY_LINES`
- Produces:
  - `createSafari(windows): { openDocs(): void, docText: HTMLElement /* 带 data-text，初始为 "…and I just" 所在段落的末尾 span */, openVoliSite(): void, downloadButton: Element, download(name, ms): Promise /* 工具栏下载进度环 */, downloadItem: Element }`
    - Google Docs 页面文字：spec 第 4 节 / 参考图原文；voli.app 页面：图标、"How well can an algorithm know you?"、按钮 "Download for Mac"、"Join 2.1 million people who decide less."、小字 "Requires macOS 14 or later"
  - `createFinder(windows, { shell }): { openFolder("Time-Based Media"), openDmg(): void, openApplications(): void, item(name): Element, copy(ms): Promise }`；DMG 窗口为深色背景、左 VOLI 图标、右 Applications 文件夹、中间箭头
  - `createStickies(windows): { line(i): Element, strike(i): void, appendLine(): HTMLElement }`

- [ ] **Step 1: 写失败的浏览器测试**（`?dev=dev-apps`）
  - `safari.docText` 的父段落文字以 `"and I just"` 结尾
  - `openVoliSite()` 后页面含 `"Download for Mac"`，标签栏多一个 voli.app 标签且为活动标签
  - `finder.openDmg()` 后存在 `item("VOLI")` 和 `item("Applications")`
  - `stickies.strike(2)` 后第 3 行（0 起算第 2 行）有删除线；`appendLine()` 返回的新元素位于最后
  - 把 `item("VOLI")` 拖到 `item("Applications")` 上，`film-drop` 事件被 Applications 收到
  - 截图对照 `desktop.png` 中 Safari、Finder、Stickies 的外观
- [ ] **Step 2:** FAIL → **Step 3:** 实现 → **Step 4:** PASS
- [ ] **Step 5:** Commit：`"Add Safari, Finder and Stickies windows"`

---

### Task 10: Messages

**Files:**
- Create: `ui/messages.js`, `assets/stylesheets/film/messages.css`, `tests/browser/messages.test.mjs`
- Modify: `scenes/dev.js`（`dev-messages`）

**Interfaces:**
- Consumes: `createWindows`、`CONTACTS`、`MIA_HISTORY`、`formatListLabel`、`formatChatStamp`、`createSound`
- Produces:
  - `createMessages(windows, { world, sound }): { open(contactId), input: HTMLInputElement, send({ silent = false }): Element, bubble(contactId, { from: "them"|"me", text?, kind = "text", silent }): Element, link(contactId, { from }): Element, typing(on: boolean): void, receipt(text: string): void, mute(contactId): void, listLabel(contactId): string }`
    - 置顶区三位（Mia 为当前时蓝色高亮，且不在下方列表里出现）；列表时间标签用 `formatListLabel(消息时间, world.time)`，随 world 更新
    - 标题栏 "To: <全名>"、右侧视频与信息按钮；时间分隔用 `formatChatStamp`
    - 气泡尾巴只出现在同一发送者连续消息的最后一条；`receipt("Read 11:48 PM")` 显示在最后一条"me"气泡下
    - `send()`：把 input 文本变成 me 气泡，清空 input，非 silent 播放 `send`；`bubble(…from:"them")` 非 silent 播放 `receive`
    - `link`：voli.app 卡片（图标、"VOLI — How well can an algorithm know you?"、"voli.app"）
    - `mute(id)`：列表行显示月亮图标

- [ ] **Step 1: 写失败的浏览器测试**（`?dev=dev-messages`，world = Oct 14 11:48 PM）
  - `open("mia")` 后标题为 `"To: Mia Chen"`；列表行顺序 Jordan、Sam、Dad、Daniel、32665；Daniel 标签 `"Monday"`，Dad 标签 `"Sunday"`
  - world 设为 Nov 24 11:47 PM 后 Daniel 标签变为 `"10/12/26"`
  - 连发三条 them 气泡：只有最后一条有尾巴
  - `input.value = "send it lol"; send()` 后出现 me 气泡，`audioLog` 新增 `send`；`send({ silent: true })` 不新增
  - `typing(true)` 出现带两个小圆点尾巴的输入中气泡；`typing(false)` 移除
  - 截图对照 `messages.png`
- [ ] **Step 2:** FAIL → **Step 3:** 实现 → **Step 4:** PASS
- [ ] **Step 5:** Commit：`"Add Messages app"`

---

### Task 11: VOLI 应用（方向 B）

**Files:**
- Create: `ui/voli.js`, `assets/stylesheets/film/voli.css`, `tests/browser/voli.test.mjs`
- Modify: `scenes/dev.js`（`dev-voli`）

**Interfaces:**
- Consumes: `createWindows`、`HOVER`、`DAYS`、`world`（深浅色）
- Produces:
  - `createVoli(windows, { world }): { open(): void, close(): void, show(screen, data?): void, button(label): Element, option(label): Element, appendLine(text): Element, menuExtraSvg: string }`
  - 屏幕与文案（逐字）：
    - `welcome`：标题 "Let’s get to know you."，副标题 "Five quick choices. There are no right answers."，按钮 "Get Started"
    - `question`（`{ index, prompt, options: [a, b] }`）：小标题 `Getting to know you · ${index} of 5`
    - `observation`：标题 "You hovered over “Stay comfortable” for 2.3 seconds."，卡片两行 "Stay comfortable 2.3 s"（灰条 100%）与 "Know the truth 0.4 s"（蓝条 17%），说明 "Hover time before you chose “Know the truth.”"
    - `autopilot`：小标题 "Deciding is tiring."，标题 "You don’t have to decide. If it’s wrong, it’s on me."，按钮 "Not Now" / "Turn On Autopilot"
    - `control`：标题 "Do you feel in control?"，按钮 "No" / "Yes"
    - `thanks`：标题 "Thank you."，副标题 "I knew you would."
    - `daily`（`{ day }` 取自 `DAYS`）：标题 "Today’s choices"，日期行，条目列表，按钮 "Accept All"，点击后底部显示 `Accepted in ${acceptedIn} s`
  - 窗口与配色随 `world.appearance` 切换（浅色为第 10 段）

- [ ] **Step 1: 写失败的浏览器测试**（`?dev=dev-voli`）
  - 依次 `show` 每个屏幕，断言上面的逐字文案存在
  - `appendLine("You deleted “I just” twice before Mia texted you.")` 后该行在卡片下方，淡入 600ms
  - `daily` 用 Day 9 时列出 "Transfer — Stay (application withdrawn)" 与 "TBM proposal — Submitted"
  - 截图对照 `voli-b.png`（深色），并截一张浅色 `daily` 自查
- [ ] **Step 2:** FAIL → **Step 3:** 实现 → **Step 4:** PASS
- [ ] **Step 5:** Commit：`"Add VOLI app screens"`

---

### Task 12: 系统对话框与系统设置

**Files:**
- Create: `ui/system.js`, `tests/browser/system.test.mjs`
- Modify: `assets/stylesheets/film/apps.css`、`scenes/dev.js`（`dev-system`）

**Interfaces:**
- Consumes: `createWindows`、`createSound`
- Produces:
  - `createSystem(windows, { sound }): { gatekeeper({ app, browser, time, host }): Dialog, accessibilityPrompt(app): Dialog, trashError(app): Dialog, settings: { openAccessibility(apps: [{ name, icon, on }]): void, toggle(name): Element, setOn(name, on, { sound }): void } }`，`Dialog = { el, button(label): Element, close() }`
  - 文案（逐字）：
    - gatekeeper：`“${app}” is an app downloaded from the Internet. Are you sure you want to open it?` + `${browser} downloaded this file today at ${time} from ${host}.`，按钮 "Cancel" / "Open"
    - accessibilityPrompt：`“${app}” would like to control this computer using accessibility features.` + `Grant access to this application in Privacy & Security settings, located in System Settings.`，按钮 "Open System Settings" / "Deny"
    - trashError：`The item “${app}” can’t be moved to the Trash because it’s open.`，按钮 "OK"；出现时播放 `finderError`
  - 系统设置窗口：左侧边栏选中 "Privacy & Security"，右侧标题 "Accessibility"，列表三行 Raycast（开）、zoom.us（开）、VOLI（关）；`setOn(name, true, { sound: "toggle" })` 动画切换并播放 `toggle`

- [ ] **Step 1: 写失败的浏览器测试**：逐字文案；`trashError` 后 `audioLog` 含 `finderError`；`setOn("VOLI", true, { sound: "toggle" })` 后开关为开、`audioLog` 含 `toggle`
- [ ] **Step 2:** FAIL → **Step 3:** 实现 → **Step 4:** PASS
- [ ] **Step 5:** Commit：`"Add system dialogs and Accessibility settings"`

---

### Task 13: 场景基建与第 0–2 段

**Files:**
- Create: `scenes/establish.js`, `scenes/00-cold-open.js`, `01-mia.js`, `02-install.js`, `tests/browser/scenes-a.test.mjs`
- Modify: `scenes/index.js`, `main.js`（把所有 ui 组装进 `ctx.ui`）

**Interfaces:**
- Consumes: Task 5–12 的全部接口
- Produces:
  - `ctx.ui = { shell, notifications, windows, safari, finder, stickies, messages, voli, system }`（`grid` 在 Task 16 加入）
  - `establish(ctx, sceneIndex): Promise<void>`：按 `TIMELINE[sceneIndex]` 设置 world，并重建该段开头的全部状态（打开哪些窗口、焦点、文档文字、便利贴、桌面文件名、Dock 运行/角标、菜单栏图标、Messages 历史、VOLI 屏幕）；各场景的 `setup` 都调用它
  - `ctx.snapshot()`：返回 `{ world, windows: [{ id, visible, active }], docText, sticky: [{ text, struck }], desktop: names, dock: { running, badges }, extras, messages: { open, counts }, voli: screen }`

各段的锚点（`ctx.at` 的毫秒数，均相对段首）与节拍名：

- **00-cold-open**：`hold` 0 → `delete-1` 1500（human `{del:6}`，无配音）→ `retype-1` 3400（`"I just"`，P1a）→ `delete-2` 6500 → `retype-2` 8000（P1b）→ `to-file` 12000（human 移到 `pros and cons (3).docx`）→ `hover-file`（`hover(4100)`）→ `select-file`（点击，`select(…, { focused: true })`）→ `mia-notify` 22000（Messages 通知 "Mia Chen" / "you need to try this lol" + M1）
- **01-mia**：`click-notif` 800 → `type-what` 2500（P2，`send`）→ `read-1` 5200（`receipt("Read 11:47 PM")`）→ `mia-typing` 6000（1500ms 后 M2 气泡，接着 1200ms → M3，1000ms → M4 "it’s lowkey way too accurate 😭"，world 到 11:48）→ `type-send` 17000（P3，`send`）→ `read-2` 19500（"Read 11:48 PM"）→ `link` 21000（输入中 1200ms → 卡片）→ `tell-me` 24000（输入中 900ms → M5）
- **02-install**：world 11:49、电量 22 → `click-link` 500 → `site` 2000 → `download` 4000（2500ms）→ `open-dmg` 7500 → `drag` 9000（拖 VOLI 到 Applications，`copy(1200)`）→ `launch` 12000（打开 Applications，双击 VOLI）→ `gatekeeper` 13500（600ms 后直接点 Open）→ `dock-bounce` 15500（Dock 加 VOLI、弹跳 1500ms）→ `welcome` 17500（VOLI 窗口打开，`welcome` 屏）

- [ ] **Step 1: 写失败的浏览器测试**：`check-scenes --scene 0`、`--scene 1`、`--scene 2`（rate 4）通过；第 0 段结束时 `docText` 以 `"I just"` 结尾、`unsent.txt` 不再选中而 `pros and cons (3).docx` 选中；第 1 段结束时 Messages 有 1 张链接卡片；第 2 段结束时 Dock 有 VOLI 且运行中；连续性：完整跑第 0 段结束时的 `snapshot()` 与 `establish(1)` 后的 `snapshot()` 深相等（忽略通知），第 1→2 段同理
- [ ] **Step 2:** FAIL → **Step 3:** 实现 → **Step 4:** PASS；`node tools/check-scenes.mjs --scene 1 --repeat 3`（rate 1）通过（节拍误差 < 50ms）
- [ ] **Step 5:** Commit：`"Add scenes 0–2: cold open, Mia, install"`

---

### Task 14: 第 3–6 段

**Files:**
- Create: `scenes/03-questions.js`, `04-observation.js`, `05-responsibility.js`, `06-handover.js`, `tests/browser/scenes-b.test.mjs`

锚点与节拍：

- **03-questions**：world 11:50 → `get-started` 2500 → `q1` 4000（"Coffee or tea?" → Coffee）→ `q2` 7000（"Text or call?" → Text）→ `q3` 10000（"Plan ahead, or figure it out as you go?"，先在 Plan ahead 上悬停 600ms → Figure it out）→ `q4` 15000（"Would you rather know the truth, or stay comfortable?"）→ `q4-hover`（移到 Stay comfortable，`hover(2300)`）→ `q4-choose`（移到 Know the truth，`hover(400)`，点击）→ `q5` 30000（"Do you usually finish what you start?" → Usually；world 11:51）
- **04-observation**：`observation` 0 → `line` 4000（`appendLine("You deleted “I just” twice before Mia texted you.")`）→ `silence` 4600（节拍名留给 Premiere：嗡鸣进入）→ 之后光标 `idle`
- **05-responsibility**：world 11:52 → `autopilot` 0 → `hesitate` 4000（移到两个按钮正中，`hover(1500)`）→ `turn-on`（点击 Turn On Autopilot）→ `prompt` 7000 → `open-settings` 8800 → `settings` 10000（Raycast 开、zoom.us 开、VOLI 关）→ `stop-short` 13000（human 移到 VOLI 开关左侧 4px 处）→ `toggle` 14400（`setOn("VOLI", true, { sound: "toggle" })`）→ `menu-extra` 16000（`menubar.showExtra("voli", voli.menuExtraSvg)`）
- **06-handover**：world 11:53 → `control` 0（VOLI 窗口回到前台）→ `reach-no` 2500（`moveTo(No, { mode: "human", until: 0.7 })`）→ `takeover`（`moveTo(Yes, { mode: "machine" })`，`click({ mode: "machine" })`）→ `thanks`（`show("thanks")`）→ `roomtone-out`（节拍名留给 Premiere）

- [ ] **Step 1: 写失败的浏览器测试**：四段 `check-scenes` 通过；第 3 段 `q4-hover` 到 `q4-choose` 间隔在 `[2300, 2800]`；第 5 段 `audioLog` 里 VOLI 相关的声音只有 `toggle`；第 6 段 `takeover` 之后没有任何 `click`/`key*` 音效；第 3→4、4→5、5→6 连续性检查通过
- [ ] **Step 2:** FAIL → **Step 3:** 实现 → **Step 4:** PASS
- [ ] **Step 5:** Commit：`"Add scenes 3–6: questions, observation, responsibility, handover"`

---

### Task 15: 第 7–9 段

**Files:**
- Create: `scenes/07-autopilot.js`, `08-mia-again.js`, `09-cant-quit.js`, `tests/browser/scenes-c.test.mjs`

锚点与节拍：

- **07-autopilot**（全部 machine）：world 11:54 → `doc` 500（移到文档末尾，点击，打 `" let them."`）→ `sticky` 7000（`strike(2)`，`appendLine()`，打 `"decided: stay"`）→ `rename` 13500（`beginRename("pros and cons (3).docx")`，打 `"decided.docx"`，`endRename()`）
- **08-mia-again**：world 11:57、电量 21 → `mia-notify` 0（"did it get you right??" + M6）→ `open` 1500（human 点击通知）→ `type-kinda` 3000（P4，`send`）→ `wait` 7000（输入中 → "wait"，M7）→ `delete-q` 8800（输入中 → "should i delete it lol"，M8）→ `yeah-delete` 11500（human 打 `"yeah dele"`，voice P5，`cutAt: 0.62`）→ `erase` 13800（machine `{ del: 9 }`，再打 `"no keep it"`，`send({ silent: true })`）→ `same-thing` 17000（VOLI 通知，`silent: true`，"You would have said the same thing."）
- **09-cant-quit**：world 11:58 → `extra-menu` 500（human 点菜单栏 VOLI 图标，出现菜单项 "Quit VOLI"）→ `quit` 2000（点击，VOLI 窗口关闭，图标保留）→ `apps` 4500（打开 Applications）→ `drag-trash` 6500（human 把 VOLI 拖到 Dock 废纸篓）→ `error` 9500（`trashError("VOLI")`）→ `ok` 12000（点 OK）

- [ ] **Step 1: 写失败的浏览器测试**：三段 `check-scenes` 通过；第 7 段结束 `docText` 以 `"I just let them."` 结尾、便利贴第 3 行有删除线且最后一行为 `"decided: stay"`、桌面含 `decided.docx` 不含 `pros and cons (3).docx`，整段 `audioLog` 为空；第 8 段 `erase` 之后没有 `send`/`key*`，Messages 最后一条 me 气泡为 `"no keep it"`；第 9 段结束菜单栏仍有 VOLI 图标；6→7、7→8、8→9 连续性通过
- [ ] **Step 2:** FAIL → **Step 3:** 实现 → **Step 4:** PASS
- [ ] **Step 5:** Commit：`"Add scenes 7–9: autopilot, Mia again, can't quit"`

---

### Task 16: 第 10 段与拉远网格

**Files:**
- Create: `ui/grid.js`, `scenes/10-days.js`, `tools/render-grid-thumbs.mjs`, `data/grid-variants.js`, `assets/film/grid/*.jpg`（生成并提交）, `tests/browser/scene-10.test.mjs`
- Modify: `main.js`（支持 `?thumb=<variant>`：只渲染一帧静态桌面，不跑场景；把 `grid` 加进 `ctx.ui`）

**Interfaces:**
- Produces:
  - `GRID_VARIANTS`：`her-day-1 … her-day-8`（她的壁纸、浅色、不同日期和 VOLI 列表）与 `other-1 … other-12`（`wallpapers/others/` 的不同壁纸、深浅色交替、窗口布局在 4 种预设里轮换）
  - `render-grid-thumbs.mjs`：对每个变体截 `?thumb=<id>` 为 960×540 JPG
  - `createGrid(stage, { tiles: { near: string[], far: string[] }, cols = 21, rows = 21 }): { zoomOut(ms): Promise }`：中心格是真实舞台；与中心切比雪夫距离 ≤ 2 的格用 `near`，其余用 `far`，按确定的伪随机顺序分配；`zoomOut` 用缓出曲线把整体从 1 缩到 `1/21`
- 锚点与节拍（world 外观 light）：`day-1` 0（Oct 15 8:12 AM，通知 silent "Today’s choices are ready." → 点击 → `daily` Day 1 → 悬停 `acceptedIn` 秒后点 Accept All）→ `day-4` 7500 → `day-9` 13500 → `day-23` 18500 → `day-40` 22500（只有 silent 通知 "Today’s choices were made for you."）→ `grid` 25000（`zoomOut(8000)`）→ `music-stop` 33000 → 结束 35000
  - 每天开头直接切换状态（不做动画），这是 Premiere 跳切的位置
  - 整段 Dock 上 Music 为运行状态

- [ ] **Step 1: 写失败的浏览器测试**：`check-scenes --scene 10` 通过；`day-*` 节拍时间等于上面的锚点（±50ms，rate 1 跑一次）；各天点击前的悬停时长与 `acceptedIn` 相差 < 100ms；`grid` 结束时舞台的屏幕宽度约为 1920/21（±2px）；网格中至少出现 12 张不同的 `far` 图片
- [ ] **Step 2:** FAIL → **Step 3:** 实现并运行 `node tools/render-grid-thumbs.mjs` → **Step 4:** PASS，截 `?scene=10&pause=33000` 自查
- [ ] **Step 5:** Commit：`"Add scene 10 and the pull-back grid"`

---

### Task 17: 第 11 段、整片检查与 Premiere 标记

**Files:**
- Create: `scenes/11-pass-it-on.js`, `tools/markers.mjs`, `tests/markers.test.mjs`, `tests/browser/full-run.test.mjs`
- Modify: `tools/check-scenes.mjs`（`--export-log <json>`）、`data/story.js`（加 `SHOTS`：以场景 id 为键、`{ [beat]: 镜头说明 }` 为值，文字照搬 spec 第 7 节分镜表，例如 `SHOTS["03-questions"]["q4-hover"] = "缓慢推到 200% 对准 Stay comfortable"`）

**Interfaces:**
- Produces:
  - 第 11 段（world Nov 24 11:47 PM、电量 18、dark，全部 machine、无声）：`messages-open` 1500（Messages 自己打开，切到 Daniel）→ `type` 3000（`"do you want to try something fun???"`，`send({ silent: true })`）→ `link` 8500（`link("daniel", { from: "me" })`，`receipt("Delivered")`）→ `daniel-typing` 13000（`typing(true)`）→ `black` 19000（舞台立即全黑）→ `final-notify` 21500（silent 通知，标题 "VOLI"，正文 "You were going to tell someone eventually."，显示在黑屏上）→ 结束 25000
  - `toMarkers(log, { fps = 30 }): Array<{ name, frame, timecode }>`：`frame = Math.round(t / 1000 * fps)`，`timecode = "HH:MM:SS:FF"`；名字为 `${scene} · ${beat}`，若 `data/story.js` 的 `SHOTS[scene]` 有镜头说明则追加 ` — ${说明}`（`SHOTS` 内容即 spec 第 7 节分镜表）
  - `toFcpXml(markers, { fps = 30, name = "VOLI markers" }): string`：一个 1920×1080、30fps 的 `<xmeml version="5">` 序列，内含每个 `<marker><name/><in/><out>-1</out></marker>`
  - `toMarkdown(markers): string`：表格 `| 时间码 | 场景 · 节拍 — 镜头 |`
  - CLI：`node tools/markers.mjs <log.json> <out-dir>` 写出 `markers.xml` 与 `markers.md`

- [ ] **Step 1: 写失败的测试**
  - `tests/markers.test.mjs`：`toMarkers([{ scene: "03-questions", beat: "q4-hover", t: 61500 }])[0]` 的 `frame === 1845`、`timecode === "00:01:01:15"`，名字含 `"推到 200%"`；`toFcpXml` 输出可被一个最小 XML 解析（检查 `<marker>` 数量与输入一致、`<rate><timebase>30</timebase>`）
  - `tests/browser/full-run.test.mjs`（rate 4）：整片跑完 `done`；12 个 `start` 节拍；最后节拍时间 ≤ 300000；`errors` 为空；无非本地请求；`audioLog` 中第 6 段之后出现的声音只允许为 Mia 相关的 `receive`、配音 `P4`/`P5`/`M6`/`M7`/`M8`、她的 `key*`/`click`/`send`（第 8 段 `erase` 前）与 `finderError`
- [ ] **Step 2:** FAIL → **Step 3:** 实现 → **Step 4:** PASS；再用 rate 1 跑一遍整片：`node tools/check-scenes.mjs --export-log /tmp/log.json && node tools/markers.mjs /tmp/log.json docs/film-markers`
- [ ] **Step 5:** Commit：`"Add scene 11, full-run check and Premiere markers"`（包含 `docs/film-markers/`）
- [ ] **Step 6（交给用户）:** 在 Premiere 里 文件 → 导入 `docs/film-markers/markers.xml`，确认出现带标记的序列；不行就用 `markers.md` 手动对照

---

### Task 18: 正式配音与录制指南

**Files:**
- Create: `tools/tts.mjs`, `tools/slice-keys.mjs`, `docs/film-recording.md`, `tests/tts.test.mjs`, `tests/slice-keys.test.mjs`

**Interfaces:**
- Produces:
  - `buildTtsRequest(line, { voiceId, modelId = "eleven_multilingual_v2" }): { url, body }`：`url = https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=pcm_44100`；`body` 含 `text`、`model_id`、`voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.2 }`
  - `pcmToWav(buffer, { sampleRate = 44100 }): Buffer`
  - CLI：`ELEVENLABS_API_KEY=… HER_VOICE_ID=… MIA_VOICE_ID=… node tools/tts.mjs [--takes 3]`：每句生成 `voice/<ID>.take1.wav … take3.wav`；`node tools/tts.mjs --pick P2=2` 把指定 take 复制为 `voice/<ID>.wav`
  - 若用户提供的是 OpenAI 的 key，则把 `buildTtsRequest` 改为 `https://api.openai.com/v1/audio/speech`（`model: "gpt-4o-mini-tts"`、`response_format: "wav"`、`instructions` 用 `VOICE_LINES[].direction`），接口不变
  - `sliceKeys(samples: Float32Array, sampleRate): Float32Array[]`：找出能量最高的 8 个瞬态（彼此间隔 ≥ 80ms），各切 120ms，首尾 5ms 淡入淡出；CLI `node tools/slice-keys.mjs <录音.wav>` 写出 `assets/film/sfx/key1.wav … key8.wav`（用户的 MacBook 打字录音替换合成占位音）
  - `docs/film-recording.md`：启动 `npm run serve`；OBS 浏览器源设置（3840×2160、30fps、通过 OBS 控制音频、URL `http://localhost:8765/?scene=N`）；12 段逐段录制；导出标记；Premiere 序列设置；Premiere 声音层（`assets/film/post/` 三个文件的用法与音量：底噪 -45 dB 第 6 段起淡出、嗡鸣 -40 dB 从第 4 段 `line` 开始、音乐只在第 10 段并在 `music-stop` 处截断，每循环慢 3%）；-16 LUFS 输出；如何替换壁纸（`assets/film/wallpapers/her.jpg`）和键盘声

- [ ] **Step 1: 写失败的测试** `tests/tts.test.mjs`：`buildTtsRequest` 的 URL 与 body 字段；`pcmToWav` 输出前 4 字节为 `RIFF`、采样率字段为 44100、数据长度等于输入长度。`tests/slice-keys.test.mjs`：一段 3 秒静音里在 10 个已知位置放入脉冲（其中 2 个幅度较小），`sliceKeys` 返回 8 段，每段长 `0.12 × sampleRate`，对应的是 8 个最强脉冲
- [ ] **Step 2:** FAIL → **Step 3:** 实现并写指南 → **Step 4:** `npm test` PASS
- [ ] **Step 5:** Commit：`"Add TTS tool and recording guide"`

---

### Task 19: 清理旧的互动版代码

**Files:**
- Delete: `src/javascripts/story.js`, `src/javascripts/apps/CHOICE.js`, `src/javascripts/apps/信息.js`, `assets/apps/CHOICE.html`, `assets/apps/信息.html`, `assets/stylesheets/apps/CHOICE/`, `assets/stylesheets/apps/信息/`
- Modify: `README.md`（顶部加一段：本分支是 VOLI 短片，入口 `index.html`，录制见 `docs/film-recording.md`）

- [ ] **Step 1:** `grep -rn "story.js\|CHOICE\|信息.js" index.html src/javascripts/film` → 无结果
- [ ] **Step 2:** 删除上述文件，修改 README
- [ ] **Step 3:** `npm test && npm run test:browser && node tools/check-scenes.mjs --rate 4` 全部通过
- [ ] **Step 4:** Commit：`"Remove the interactive story version"`
