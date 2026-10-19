# VOLI — Screenlife 短片设计文档

日期：2026-10-19
分支：`screenlife-film`（从 `choice-story` 的 `cc193ae` 切出）
状态：设计已逐节确认，待整体审阅

---

## 1. 作品在说什么

**大多数人害怕选择、害怕面对、害怕承担后果。于是一个无声无息、看起来让生活更方便的东西被请进门；它先是帮忙，后来变成入侵。**

- 主角既是受害者也是共谋者：门是她自己打开的，因为她害怕承担责任。
- VOLI 卖的是"免责"：*"You don’t have to decide. If it’s wrong, it’s on me."*
- 一个人不再自己选择，就会变得越来越容易预测，直到"这个人"本身被预测取代。
- 形式本身就是主题：观众看视频，本来就不能做选择；他们只能看着她的选择一点点被拿走。

## 2. 已确定的决定

| 项目 | 决定 |
|---|---|
| 观众角色 | 只看。主角的光标、打字、犹豫全部由网页按剧本自动演出 |
| 实现路线 | 网页自动演出 → OBS 录制 → Premiere 里做镜头、环境声、音乐、调色（路线 C） |
| 剪辑软件 | Premiere Pro |
| 配音 | AI 配音：主角和 Mia 有声音；VOLI 永远不发声 |
| 语言 | 纯英文界面和配音，不加字幕 |
| 画幅 / 时长 | 16:9，1080p 输出，总长 ≤ 5:00（目标约 4:45） |
| 系统外观 | macOS Sequoia。深夜为深色模式；第 10 段白天为浅色模式（系统外观"自动"） |
| VOLI 视觉 | 方向 B：像 macOS 自带功能（系统原生控件、SF 字体、屏幕使用时间式的数据卡片） |
| 互动版 | 不再保留，旧版本留在 `choice-story` 分支和 git 历史里 |
| 结尾 | 不切到 Daniel 的屏幕，停在主角屏幕上 |

## 3. 世界设定

**时间线**（所有界面只读这一份虚构时间，绝不使用电脑的真实时间）：

| 节拍 | 菜单栏时间 | 电量 | 外观 |
|---|---|---|---|
| 0–1 | Wed Oct 14 11:47–11:48 PM | 23% | 深色 |
| 2–4 | 11:49–11:51 PM | 22% | 深色 |
| 5–7 | 11:52–11:54 PM | 22% | 深色 |
| 8–9 | 11:57–11:58 PM | 21% | 深色 |
| 10 | Day 1 Thu Oct 15 8:12 AM → Day 40 Mon Nov 23 8:12 AM | 各不相同 | 浅色 |
| 11 | Tue Nov 24 11:47 PM（和开场同一时刻） | 18% | 深色 |

**主角**：大学生，Time-Based Media 课在写期中提案，长期纠结要不要转学。全片不出现她的名字。

**桌面文件**（右上角起，按 Finder 默认方式排列；图标用 QuickLook 真实预览）：
`Time-Based Media`、`Screenshots`、`pros and cons (3).docx`、`transfer application (unsubmitted).pdf`、`unsent.txt`（灰色"已选中但不在焦点"）、`soundwalk_take4.wav`、`midterm proposal FINAL (2).docx`、`IMG_4471.HEIC`、`Screenshot 2026-10-14 at 1.12.47 AM.png`、`mia bday ideas.txt`

**便利贴（Stickies）**：
```
TBM proposal — Thu 9AM
call mom back
decide transfer by Fri??
laundry (actually)
return jordan’s charger
```

**Messages 联系人**：置顶 Mia（照片头像）、Mom（灰色缩写）、3rd floor 🪴（群聊照片）；列表 Jordan (TBM)（未读）、Sam Okafor、Dad（"Mom said you sounded stressed. Everything ok? Call when you can"）、Daniel Kim（"haha ok see u thursday"，Monday）、32665（Instagram 验证码）。列表里的时间标签（"10:02 PM"、"Monday"、"10/12/26"）按当前虚构时间换算，所以第 11 段里同一条消息会显示成日期。

## 4. 视觉规范

参考图（1:1，已确认）：

- 桌面：[`screenlife-film-mockups/desktop.png`](screenlife-film-mockups/desktop.png)（可交互版本 `desktop.html`）
- Messages：[`screenlife-film-mockups/messages.png`](screenlife-film-mockups/messages.png)
- VOLI 方向 B：[`screenlife-film-mockups/voli-b.png`](screenlife-film-mockups/voli-b.png)

参考图只规定外观；图里的时间、电量和具体文字以第 3、5 节为准。

**通用规则（macOS Sequoia 的"厚度"来源）**：
- 壁纸是有景深的照片（正式版用用户提供的照片；参考图里是临时生成的占位图）。
- 毛玻璃材质：菜单栏、通知、Dock、侧栏使用 `backdrop-filter: blur(40px) saturate(180%)` 并透出壁纸。
- 窗口层级：活动窗口用彩色红绿灯和深而大的阴影；非活动窗口用灰色红绿灯和浅阴影。
- 菜单栏状态图标画成 SF Symbols 的样子（电量、Wi‑Fi、聚焦搜索、控制中心），不用文字代替。
- 图标和文件预览来自真实系统素材：应用图标用 `sips` 从 `.icns` 导出；文件预览用 `qlmanage -t` 生成；文本文件画成白底页面。
- Dock：有运行指示点、Mail 未读 214、满的废纸篓、日历图标显示当天日期。
- 光标：在文字上显示 I 形，其他地方显示箭头，带投影。

**需要做的界面**：

| 界面 | 用在第几段 | 说明 |
|---|---|---|
| 桌面 + 菜单栏 + Dock + 通知 | 全片 | 通知自己实现、可堆叠，去掉对外部 WebSwift 脚本的依赖 |
| Safari（Google Docs 页面） | 0, 7 | 深色工具栏，网页内容保持 Google Docs 的浅色 |
| Safari（voli.app 官网 + 下载进度） | 2 | 官网：图标、"How well can an algorithm know you?"、"Download for Mac"、"Join 2.1 million people who decide less." |
| Finder：DMG 窗口、应用程序文件夹 | 2, 9 | DMG 窗口里是"VOLI → Applications"的拖拽示意 |
| Messages | 1, 8, 11 | 按参考图：置顶、"To:" 标题、气泡尾巴、已读回执、链接卡片、输入中气泡 |
| VOLI 窗口（方向 B） | 3–6, 10 | 引导页、问题页、观察页（悬停时长卡片）、Autopilot 页、"每天的选择"列表页 |
| Stickies | 0, 7 | 真正的浮动窗口；第 7 段出现删除线和新的一行 |
| 系统对话框 | 2, 5, 9 | 安全警告、辅助功能权限、"无法移到废纸篓"，严格照 macOS 原文和布局 |
| 系统设置：隐私与安全性 → 辅助功能 | 5 | 列表里有其他 app（如 Zoom、Raycast）和 VOLI，各有开关 |
| VOLI 菜单栏图标 | 5 起 | 一个小的单色图标，出现后一直在 |
| 浅色模式皮肤 | 10 | 菜单栏、Dock、VOLI 窗口、通知的浅色版本 |
| 拉远网格 | 10 | 见第 5 节第 10 段 |

## 5. 剧本（约 4:45）

**贯穿全片的三条规则**：
1. **两种光标**：她的光标有缓动、过冲、轻微抖动、会绕路；VOLI 控制时，光标匀速、走直线、没有抖动。
2. **两种打字**：她打字有键盘声和配音，打字时长等于配音时长；VOLI 打字没有键盘声、没有配音，固定每字 45ms。
3. **展示，不讲述**：VOLI 不解释自己，只拿出证据。

| # | 时间 | 内容 |
|---|---|---|
| 0 | 0:00–0:25 | **冷开场**。Safari 里的 Google Doc，光标停在 "...and I just" 后面。她删掉 "I just"，停顿，重打；再删一次，再打一次（配音 P1a、P1b）。光标移到桌面 `pros and cons (3).docx` 上停 4.1 秒，点一下选中，没有打开。0:22，Mia 的通知滑入（接收音 + 配音 M1）。 |
| 1 | 0:25–0:55 | **Mia**。点通知，Messages 打开。她打 "what is it?"（P2）发送。Mia 输入中 → "this weird app i found"（M2）、"it asks you random stuff and then guesses what you’re gonna pick"（M3）、"it’s lowkey way too accurate 😭"（M4）。她打 "send it lol"（P3）。Read 11:48 PM。Mia 发来 voli.app 链接卡片，再发 "tell me if it gets you right lol"（M5）。 |
| 2 | 0:55–1:15 | **安装**。点卡片 → Safari 打开 voli.app → 点 Download for Mac → 下载进度 → 打开 VOLI.dmg → 拖进 Applications → 双击 VOLI → 安全警告："“VOLI” is an app downloaded from the Internet. Are you sure you want to open it?"（附 "Safari downloaded this file today at 11:49 PM from voli.app."）她**直接点 Open**。VOLI 图标在 Dock 里弹跳。 |
| 3 | 1:15–1:55 | **问题**。引导页 "Let’s get to know you." / "Five quick choices. There are no right answers." → Get Started。Q1 "Coffee or tea?" → Coffee（快）；Q2 "Text or call?" → Text（快）；Q3 "Plan ahead, or figure it out as you go?" → Figure it out；Q4 "Would you rather know the truth, or stay comfortable?" → 光标停在 Stay comfortable 上 **2.3 秒**，然后点了 Know the truth；Q5 "Do you usually finish what you start?" → Usually（她背后那份提案还没写完）。 |
| 4 | 1:55–2:10 | **观察**。"You hovered over “Stay comfortable” for 2.3 seconds."，下面是悬停时长卡片（Stay comfortable 2.3 s / Know the truth 0.4 s）。2 秒后下面浮现一行："You deleted “I just” twice before Mia texted you." 之后静音 3 秒，低频嗡鸣进入。 |
| 5 | 2:10–2:35 | **免责**。"Deciding is tiring." / **"You don’t have to decide. If it’s wrong, it’s on me."** 按钮 [Not Now] [Turn On Autopilot]。她的光标在两个按钮之间停 1.5 秒，点了 Turn On Autopilot。系统弹窗："“VOLI” would like to control this computer using accessibility features." / "Grant access to this application in Privacy & Security settings, located in System Settings." [Open System Settings] [Deny]。她点 Open System Settings → 辅助功能列表 → 光标移到 VOLI 的开关，停在离它 4px 的地方，开关自己"咔哒"一声打开（全片 VOLI 唯一的声音）。菜单栏出现 VOLI 图标。 |
| 6 | 2:35–2:50 | **交接**。VOLI 窗口回到前台："Do you feel in control?" [No] [Yes]。她抖动的光标移向 No，走到七成时，运动突然变成匀速直线，转向 Yes 并点下（没有点击声）。"Thank you." / "I knew you would." 房间底噪在 2 秒内淡出。 |
| 7 | 2:50–3:10 | **Autopilot**（全程无声）。① 文档里在 "I just" 后面打出 " let them."；② 便利贴给 "decide transfer by Fri??" 加删除线，新增一行 "decided: stay"；③ 桌面上 `pros and cons (3).docx` 进入重命名状态，改成 `decided.docx`。每件事约 6 秒，光标走直线。 |
| 8 | 3:10–3:30 | **替她回 Mia**（11:57 PM）。Mia："did it get you right??"（M6）。她打 "kinda this is weird"（P4）发送。Mia："wait"（M7）、"should i delete it lol"（M8）。她开始打 "yeah delete—"（P5，配音断在一半）；输入框里的字被逐个无声删掉，换成 "no keep it"，发出时**没有发送音**。随后一条 VOLI 通知无声滑入："You would have said the same thing." |
| 9 | 3:30–3:45 | **退不掉**。她从菜单栏选 VOLI → Quit VOLI，窗口关闭，菜单栏图标还在。打开 Applications，把 VOLI 拖到废纸篓 → 提示 "The item “VOLI” can’t be moved to the Trash because it’s open."（Finder 报错音）[OK]。镜头的"呼吸"在这一段回来。 |
| 10 | 3:45–4:20 | **很多天**。硬切到 Day 1 早上（浅色模式）。每天的画面一样：通知 "Today’s choices are ready." → VOLI 列表 → 她点 Accept All → 底部显示 "Accepted in X s"。Dock 上 Music 在放 VOLI 选的歌单 "On Repeat"。<br>Day 1 (Thu Oct 15)：Lunch — Ramen；Outfit — Black hoodie, jeans；Playlist — On Repeat。Accepted in 2.3 s<br>Day 4 (Sun Oct 18)：Reply to Mom — "busy this week, call sunday"；Sam’s dinner — Skip。Accepted in 1.4 s<br>Day 9 (Fri Oct 23)：Transfer — Stay (application withdrawn)；TBM proposal — Submitted。Accepted in 0.6 s<br>Day 23 (Fri Nov 6)：Mia Chen — Mute conversation；Jordan (TBM) — Decline。Accepted in 0.2 s<br>Day 40 (Mon Nov 23)：没有窗口，只有通知 "Today’s choices were made for you."<br>然后**拉远**：从 Day 40 的屏幕往后退，旁边是她的其他日子（菜单栏日期不同），越往外壁纸越不一样（是别人的屏幕），直到几百个。拉到最远时音乐戛然而止，静止 2 秒。 |
| 11 | 4:20–4:45 | **传下去**。硬切回 Tue Nov 24 11:47 PM（深色）。Messages 自己打开，切到 Daniel Kim，无声打出 "do you want to try something fun???" 并发送（无发送音），再发出 voli.app 链接卡片。Delivered。Daniel 的"正在输入…"出现 → 切黑。黑屏上，一条通知无声滑入："VOLI — You were going to tell someone eventually." 停 3 秒，结束。 |

**配音清单**（AI 生成；文件名就是编号）：

| 编号 | 角色 | 台词 | 语气 |
|---|---|---|---|
| P1a | 她 | "I just" | 很轻，半自言自语 |
| P1b | 她 | "I just…" | 更轻，尾音拖住 |
| P2 | 她 | "what is it?" | 好奇，疲惫 |
| P3 | 她 | "send it lol" | 无所谓 |
| P4 | 她 | "kinda this is weird" | 有点不安，笑着说 |
| P5 | 她 | "yeah delete—" | 在 "delete" 处被截断 |
| M1 | Mia | "you need to try this lol" | 明亮，兴奋 |
| M2 | Mia | "this weird app i found" | 随意 |
| M3 | Mia | "it asks you random stuff and then guesses what you’re gonna pick" | 语速快 |
| M4 | Mia | "it’s lowkey way too accurate" | 带笑 |
| M5 | Mia | "tell me if it gets you right lol" | 随意 |
| M6 | Mia | "did it get you right??" | 好奇 |
| M7 | Mia | "wait" | 突然认真 |
| M8 | Mia | "should i delete it lol" | 半开玩笑，有点不安 |

声线：她是二十岁左右的女声，低、近、疲惫，不表演；Mia 是二十岁左右的女声，更亮、更快、更随意。

## 6. 声音

**核心规则：她的一切都有声音，VOLI 的一切都没有声音。**

网页里播放（OBS 一起录进去）：

| 声音 | 规格 |
|---|---|
| 配音 | 见上表。她的配音音量最高；Mia 比她低约 3dB |
| 键盘 | MacBook 键盘录音，6–8 个按键样本按固定顺序轮换，空格和回车单独一种；VOLI 打字时静音 |
| 触控板点击 | 她每次点击播放；VOLI 点击时静音 |
| 系统音效 | Messages 发送/接收、通知提示音、Finder 报错音，使用 macOS 自带音效文件 |
| 唯一例外 | 第 5 段辅助功能开关的"咔哒" |

Premiere 里加：

| 层 | 规格 |
|---|---|
| 房间底噪 | 宿舍深夜环境声（冰箱、远处车流、空调），约 -45 dB；第 6 段起 2 秒内淡出，之后不再出现 |
| 低频嗡鸣 | 40–60Hz，从第 4 段那句话出现时开始，约 -40 dB，第 10 段音乐进入时让位 |
| 音乐 | 只用于第 10 段：温柔重复的钢琴/音乐盒循环，每循环一次慢约 3%、音高下沉一点；拉到最远时突然停 |

**刻意的沉默**：第 4 段那句话出现之后（3 秒）；第 8 段配音断掉之后；第 10 段音乐停下之后（2 秒）；第 11 段黑屏和最后那条无声通知。

**响度**：成片整体响度 -16 LUFS（课堂放映 / 网络）。

**版权**：macOS 系统音效、图标和字体属于 Apple。课堂作业可以使用；如果要公开发布或参展，需要换成 CC0 授权的替代品。

## 7. 镜头（在 Premiere 里做）

用 4K 录、1080p 输出，最多推近到 200%。

**规则**：
1. **人的镜头会呼吸**：她操作时，画面持续极慢地漂移和缩放（10 秒内不超过 2%），使用缓入缓出关键帧。
2. **VOLI 的镜头是死的**：从第 6 段起镜头完全静止；需要移动时只用线性关键帧，匀速、走直线。第 9 段（她最后一次反抗）呼吸回来。
3. **镜头跟着注意力走**：她打字时推近输入框，回复来时拉回。

**分镜**：

| # | 镜头 |
|---|---|
| 0 | 130% 对准 "I just" 开始；随光标移向桌面，慢慢拉到 100%；通知出现时向右上角轻推 |
| 1 | 她打字时推到 160% 对准输入框；链接卡片出现时拉回 120% |
| 2 | 140% 跟着下载 → Finder；安全警告居中 150% |
| 3 | 前三题 120% 不动；Q4 悬停的 2.3 秒里缓慢推到 200% 对准 "Stay comfortable" |
| 4 | 卡片静止；那句话出现后，5 秒内极慢推近 5% |
| 5 | 150% 对准权限弹窗 → 平移到系统设置 → 200% 对准开关 |
| 6 | 光标转向 Yes 的那一帧起，镜头停止漂移 |
| 7 | 线性匀速依次平移到文档、便利贴、文件名，每处停 2 秒 |
| 8 | 200% 对准 Messages 输入框，停在字被逐个删掉的过程上 |
| 9 | 回到 100%，漂移恢复 |
| 10 | 每一天在菜单栏日期变化那一帧跳切，每天 1.5–3 秒，越来越短；拉远由网页渲染，Premiere 只加少量运动模糊 |
| 11 | 100% 看 Messages 自己打字，推近"正在输入…"，切黑 |

全片只有两处硬切：进入第 10 段（深夜 → Day 1 早上），以及第 11 段开头（Day 40 网格 → 今天深夜）。

## 8. 架构（网页端）

**入口**：`index.html` 直接进入影片模式，打开就从第 0 段开始自动播放。

**舞台**：固定 1920×1080 的逻辑舞台，按窗口宽度整体缩放（OBS 设 3840×2160 时缩放 2 倍）。用 CSS `zoom` 保证 4K 下文字清晰锐利，需实测确认。真实鼠标隐藏。

**新增模块** `src/javascripts/film/`：

| 模块 | 职责 |
|---|---|
| `director.js` | 按顺序运行场景；`?scene=N` 从第 N 段开始（每段有确定的初始状态）；`?debug=1` 显示时间码和节拍名；记录每个节拍开始的时间，可导出 JSON |
| `world.js` | 虚构时间、电量、深浅色外观；菜单栏、Dock 日历、聊天时间戳、VOLI 数据都订阅它 |
| `cursor.js` | 两种运动模式：`human`（缓动、过冲、抖动、点击声）和 `machine`（线性、无抖动、无声）；悬停和点击会派发真实 DOM 事件 |
| `keyboard.js` | 两种打字模式：`human`（按配音时长分配每字间隔，标点处停顿，剧本里写好的删除，带键盘声）和 `machine`（45ms 一字，无声） |
| `sound.js` | 预加载并播放配音和音效；按编号取配音时长供 `keyboard.js` 使用 |
| `notifications.js` | 自己实现的 macOS 通知：堆叠、分组、可设为无声 |
| `ui/*.js` | 各个界面组件：桌面图标、Safari、Finder、Messages、VOLI、Stickies、系统对话框、系统设置、浅色皮肤 |
| `grid.js` | 第 10 段的拉远网格 |
| `scenes/00-cold-open.js` … `scenes/11-pass-it-on.js` | 剧本本体，每段一个文件 |

**对现有代码的处理**：
- `story.js`、`apps/CHOICE.js`、`apps/信息.js` 里的 `setTimeout` 链和"等点击"逻辑由导演和场景取代。
- 现有的 Messages 和 VOLI 界面按第 4 节的参考图重做。
- `ui/notification.js` 不再依赖 `mengobs.github.io/WebSwift`。
- Webintosh 原有的拖拽、右键菜单等交互，在影片模式下全部关闭。

**拉远网格（第 10 段）**：
- 中心是真实的 Day 40 舞台。
- 周围的屏幕是预先渲染好的缩略图：近处是她的其他日子，远处是"别人的屏幕"（不同壁纸、不同深浅色、不同窗口布局，至少 12 种变体轮换）。
- 拉远是网页内的动画（约 8 秒，缓出），从 1 个屏幕拉到约 20×20 个。
- 缩略图用无界面 Chrome 截图生成，脚本放在 `tools/`。

**Premiere 标记**：
- 在 Chrome 里用 `?debug=1` 跑一遍，导出节拍时间 JSON。
- `tools/markers-to-xml.mjs` 把它转成 FCP7 XML（每个节拍一个序列标记）。
- 实现时要先确认 Premiere 能导入；不行的话改为输出一份带时间码的标记表。

## 9. 素材

| 素材 | 来源 |
|---|---|
| 应用图标、文件夹图标、废纸篓 | 从这台 Mac 的 `.icns` / Dock 资源用 `sips` 导出 |
| 文件预览 | 用 `qlmanage -t` 对真实文件生成；文本文件和音频文件按 Finder 样式画 |
| 壁纸 | **用户提供**一张自己拍的照片（深夜、失焦最好）。在拿到之前用生成的占位图 |
| 别人的壁纸（网格用） | 至少 12 张；可以混用占位图、系统自带壁纸缩略图和用户提供的照片 |
| 联系人头像 | Mia、3rd floor、Jordan 用生成的"手机照片"；其他人用灰色缩写 |
| 配音 | AI TTS。**用户提供** ElevenLabs 或 OpenAI 的 API key；拿到之前用 macOS `say` 生成占位音，换正式音频不需要改代码 |
| 键盘声 | 优先请用户用手机录 30 秒自己 MacBook 的打字声；备选 CC0 素材（下载前先征得同意） |
| 系统音效 | macOS 自带音效文件 |
| 房间底噪 | 优先请用户录 1 分钟自己房间深夜的环境声；备选 CC0 |
| 低频嗡鸣、音乐循环 | 先用程序生成可用版本，用户可以替换 |

## 10. 录制和后期流程

1. OBS 新建"浏览器源"：URL 为本地服务地址加 `?scene=N`，3840×2160，30fps，勾选"通过 OBS 控制音频"。
2. 一段一段录（12 段），每段单独一个文件。
3. 在 Chrome 里用 `?debug=1` 跑一遍，导出节拍时间，生成 Premiere 标记。
4. Premiere 序列：1920×1080，30fps。按第 7 节做镜头，按第 6 节加底噪、嗡鸣和音乐，调色，按 -16 LUFS 输出。

## 11. 验收标准

- 12 段都可以用 `?scene=N` 单独播放；同一段连续播放 3 次，节拍时间误差小于 50ms。
- 总时长（节拍日志里的总和）不超过 5:00。
- 播放时没有任何外部网络请求，也没有任何地方显示真实时间。
- 与第 4 节三张参考图对比：材质、层级、图标、字体一致。
- 4K 截图里文字边缘清晰，没有位图放大的模糊。
- 第 5 节规则逐条检查：她的光标和 VOLI 的光标、她的打字和 VOLI 的打字，在画面和声音上都能区分开。
- Premiere 标记文件能导入（由用户在 Premiere 里确认）。

## 12. 不做的事

- 互动模式、字幕、中文版本。
- 切到 Daniel 的屏幕。
- 在网页里做镜头运动（第 10 段拉远网格除外）。
- 自动渲染成片：成片由 OBS 录制加 Premiere 剪辑完成。

## 13. 风险

| 风险 | 应对 |
|---|---|
| OBS 浏览器源在 4K 下渲染大量毛玻璃会掉帧 | 第一个开发步骤就做 4K 录制测试；不行就降低模糊半径，或改用 OBS 窗口捕获录 Chrome |
| AI 配音不够自然 | 每句生成 3 个版本挑选；台词都很短，必要时可以由真人补录 |
| 拉远网格太重 | 周围屏幕全部用预渲染图片，只有中心一个是真实界面 |
| Apple 素材的版权 | 只用于课堂；公开发布前替换 |
